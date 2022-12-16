import puppeteer from "puppeteer";
import fs from "fs";

const preparePageForTests = async (page) => {
  const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
  await page.setUserAgent(userAgent);
};

const browserConfig = {
  headless: false,
  // ignoreDefaultArgs: [
  //   "--enable-automation",
  // ],
  // dumpio: true,
  // autoClose: true,
  // devtools: false,
  ignoreHTTPSErrors: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  // userDataDir:
  //   "C:\\Users\\Fabián Medina\\AppData\\Local\\Google\\Chrome\\User Data",
  args: [
    `--window-size=1250,800`,
    "--no-sandbox",
    "--disable-setuid-sandbox",
    // "--disable-gpu",
  ],
  defaultViewport: { width: 1250, height: 800 },
};

const login = async () => {
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();
  await preparePageForTests(page);

  await page.goto("https://www.macys.com/account/signin");

  await page.type("#email", "fabianmedina09@gmail.com");
  await page.type("#pw-input", "yEvP2*+3E#G$77g");
  await page.click("#sign-in");
  await page.waitForTimeout(5000);

  const dataCookies = await page.cookies();
  dataCookies.push({ name: "currency", value: "CNY", domain: "macys.com" });
  dataCookies.push({
    name: "shippingCountry",
    value: "CN",
    domain: "macys.com",
  });
  const cookies = JSON.stringify(dataCookies);
  const sessionStorage = await page.evaluate(() =>
    JSON.stringify(sessionStorage)
  );
  const localStorage = await page.evaluate(() => JSON.stringify(localStorage));

  await fs.writeFile("./cookies.json", cookies);
  await fs.writeFile("./sessionStorage.json", sessionStorage);
  await fs.writeFile("./localStorage.json", localStorage);
  browser.close();
};

const loadData = async (page) => {
  const cookiesString = await fs.readFile("./cookies.json");
  const cookies = JSON.parse(cookiesString);

  const sessionStorageString = await fs.readFile("./sessionStorage.json");
  const sessionStorage = JSON.parse(sessionStorageString);

  const localStorageString = await fs.readFile("./localStorage.json");
  const localStorage = JSON.parse(localStorageString);

  await page.setCookie(...cookies);
  await page.evaluate((data) => {
    for (const [key, value] of Object.entries(data)) {
      sessionStorage[key] = value;
    }
  }, sessionStorage);

  await page.evaluate((data) => {
    for (const [key, value] of Object.entries(data)) {
      localStorage[key] = value;
    }
  }, sessionStorage);
};

const addProductToCart = async ({ url, size, color }) => {
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();
  await preparePageForTests(page);
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const colorLi = await page.$$(
      `ul > li.color-swatch:nth-child(${color}) > div`
    );
    await colorLi[0].click();

    await page.click('li.swatch-itm[data-index="' + size + '"]');
    await page.waitForTimeout(2000);

    const [buttonBag] = await page.$x("//button[contains(., 'Add To Bag')]");
    if (buttonBag) {
      await buttonBag.click();
    }

    await page.waitForTimeout(2000);
    const [buttonContinue] = await page.$x(
      "//button[contains(., 'Continue Shopping')]"
    );
    if (buttonContinue) {
      await buttonContinue.click();
    }
  } catch (error) {
    console.log(error);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
};

export const macysSelectProducts = async (url, color = 1, size = 1) => {
  // await login();
  // await loadData(page);
  await addProductToCart({ url, size, color });
  // await page.setExtraHTTPHeaders({
  //   "upgrade-insecure-requests": "1",
  //   accept:
  //     "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
  //   connection: "keep-alive",
  // });
};
