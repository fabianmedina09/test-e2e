import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true, 
    args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
        '--disable-features=AudioServiceOutOfProcess'
    ],
  });
  const page = await browser.newPage();

  //   await page.goto("https://macys.com");
  try {
    await page.goto("https://macys.com/", {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
  } catch (error) {
    console.log(error);
  }

  console.log("before waiting");
  await page.waitForTimeout(10000);
  console.log("after waiting");

  // Type into search box.
  //   await page.type('.devsite-search-field', 'Headless Chrome');

  //   // Wait for suggest overlay to appear and click "show all results".
  //   const allResultsSelector = '.devsite-suggest-all-results';
  //   await page.waitForSelector(allResultsSelector);
  //   await page.click(allResultsSelector);

  //   // Wait for the results page to load and display the results.
  //   const resultsSelector = '.gsc-results .gs-title';
  //   await page.waitForSelector(resultsSelector);

  //   // Extract the results from the page.
  //   const links = await page.evaluate(resultsSelector => {
  //     return [...document.querySelectorAll(resultsSelector)].map(anchor => {
  //       const title = anchor.textContent.split('|')[0].trim();
  //       return `${title} - ${anchor.href}`;
  //     });
  //   }, resultsSelector);

  // Print all the files.
  //   console.log(links.join("\n"));

  await browser.close();
})();
