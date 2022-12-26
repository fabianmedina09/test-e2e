import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

puppeteer.use(StealthPlugin());
// https://www.macys.com/myaccount/home

export const openBrowser = async (params) => {
  const browserConfig = {
    headless: false,
    ignoreHTTPSErrors: true,
    slowMo: 20,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    userDataDir: `./tmp/${params?.id || "default"}`,
    args: [
      `--window-size=1450,800`,
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-web-security",
    ],
    defaultViewport: { width: 1450, height: 800 },
  };
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
  await page.setUserAgent(userAgent);
  await page.setExtraHTTPHeaders({
    "upgrade-insecure-requests": "1",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    connection: "keep-alive",
  });
  return { browser, page };
};

export const configBrowser = async ({ id }) => {
  const { page } = await openBrowser({ id });
  await page.goto("https://www.macys.com", {
    waitUntil: "networkidle0",
  });
};

const login = async ({ id, email, password }) => {
  let logged = false;
  const { browser, page } = await openBrowser({ id });

  try {
    await fs.readFileSync(`./data/${id}/cookies.json`);
    await loadData({ page, id });
    return { browser, page, logged: true };
  } catch (error) {
    console.log("Not found session data...");
  }

  await page.goto("https://www.macys.com/account/signin", {
    waitUntil: "networkidle0",
  });

  await page.type("#email", email);
  await page.type("#pw-input", password);
  await page.click("#sign-in");
  await page.waitForTimeout(5000);

  const lblError = (await page.content()).match(
    /Sorry, it looks like there\'s a problem on our end/gi
  );
  if (lblError) {
    throw new Error("Error in macys login, try login manually");
  }

  try {
    const [buttonCancel] = await page.$x("//button[contains(., 'Cancel')]");
    if (buttonCancel) {
      await buttonCancel.click();
    }
  } catch (error) {
    console.log("No cancel button before login...");
  }

  const dataCookies = await page.cookies();
  const cookies = JSON.stringify(dataCookies)
    .replace(
      '"name":"currency","value":"COP"',
      '"name":"currency","value":"CNY"'
    )
    .replace(
      '"name":"shippingCountry","value":"US"',
      '"name":"shippingCountry","value":"CN"'
    );
  const sessionStorage = await page.evaluate(() =>
    JSON.stringify(sessionStorage)
  );
  const localStorage = await page.evaluate(() => JSON.stringify(localStorage));

  try {
    const dir = `./data/${id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(`./data/${id}/cookies.json`, cookies);
    fs.writeFileSync(`./data/${id}/sessionStorage.json`, sessionStorage);
    fs.writeFileSync(`./data/${id}/localStorage.json`, localStorage);

    logged = true;
  } catch (error) {
    console.log(error);
  } finally {
    return { browser, page, logged };
  }
};

const loadData = async ({ page, id }) => {
  const cookiesString = await fs.readFileSync(`./data/${id}/cookies.json`);
  const cookies = JSON.parse(cookiesString);
  const sessionStorageString = await fs.readFileSync(
    `./data/${id}/sessionStorage.json`
  );
  const sessionStorage = JSON.parse(sessionStorageString);
  const localStorageString = await fs.readFileSync(
    `./data/${id}/localStorage.json`
  );
  const localStorage = JSON.parse(localStorageString);
  await page.setCookie(...cookies);
  await page.evaluateOnNewDocument((data) => {
    for (const [key, value] of Object.entries(data)) {
      sessionStorage[key] = value;
    }
  }, sessionStorage);
  await page.evaluateOnNewDocument((data) => {
    for (const [key, value] of Object.entries(data)) {
      localStorage[key] = value;
    }
  }, sessionStorage);
};

const addProductToCart = async ({ url, size, color, page }) => {
  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    const colorLi = await page.$$(
      `ul > li.color-swatch:nth-child(${color}) > div`
    );
    await colorLi[0].click();
    await page.click('li.swatch-itm[data-index="' + size + '"]');

    const [buttonBag] = await page.$x("//button[contains(., 'Add To Bag')]");
    if (buttonBag) {
      await buttonBag.click();
    }
    await page.waitForTimeout(3000);
    const lblError = (await page.content()).match(
      /Please try again, a technical issue occurred/gi
    );
    if (lblError) throw new Error("Error in macys with add product to bag");

    const [buttonContinue] = await page.$x(
      "//button[contains(., 'Continue Shopping')]"
    );
    if (buttonContinue) {
      await buttonContinue.click();
    }
  } catch (error) {
    throw error;
  }
};

const checkout = async (page) => {
  try {
    await page.goto(
      "https://www.macys.com/chkout/internationalShipping?perfectProxy=true",
      { waitUntil: "networkidle2" }
    );

    const frame = page
      .frames()
      .find((f) =>
        f.url().startsWith("https://checkout.prd.borderfree.com/v5")
      );

    await frame.type("#shipping-email", "fabian@alleycorpsur.com");
    await frame.type("#shipping-first-name", "Fabian");
    await frame.type("#shipping-last-name", "Medina");
    await frame.type("#shipping-address-line1", "B16hao 3dan Yuan 601");
    await frame.type("#shipping-address-line2", "QingDao, Shandong");
    await frame.type("#shipping-postal-code", "266000");
    await frame.type("#shipping-city", "QingDao");
    await frame.select("#shipping-province", "string:SD");
    await frame.type("#shipping-tel", "15555151447");

    await frame.$eval("#continue-btn-left", (form) => form.click());
    await frame.$eval("#opt-in-borderfree-email", (form) => form.click());
    await frame.$eval("#opt-in-merchant-email", (form) => form.click());
  } catch (error) {
    throw error;
  }
};

export const configLoginData = async (userData) => {
  let browserInit;
  let errorMsg;
  try {
    const { browser } = await login({
      id: userData.id,
      email: userData.email,
      password: userData.password,
    });
    browserInit = browser;
  } catch (error) {
    errorMsg = error.message || "Error in login macys";
  } finally {
    if (browserInit) await browserInit.close();
    return errorMsg;
  }
};

export const macysSelectProducts = async ({ userData, products }) => {
  let browserInit;
  try {
    const { browser, page, logged } = await login({
      id: userData.id,
      email: userData.email,
      password: userData.password,
    });
    browserInit = browser;

    if (logged) {
      for (const { url, size, color } of products) {
        await addProductToCart({ url, size, color, page });
      }
      await checkout(page);
    }
  } catch (error) {
    console.log(error);
  } finally {
    // if (browserInit) await browserInit.close();
  }
};
