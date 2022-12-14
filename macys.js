import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      `--window-size=1550,1000`
    ],
    defaultViewport: {
      width: 1550,
      height: 1000
    }
  });

  const page = await browser.newPage();
  // await page.setViewport({ width: 1366, height: 768 });
  await page.setExtraHTTPHeaders({
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
    'upgrade-insecure-requests': '1',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  })

  try {
    await page.goto('https://www.macys.com/', { waitUntil: 'networkidle2' });
  } catch (error) {
    console.log(error);
  }

  await page.type('#globalSearchInputField', 'Calvin clein');
  page.keyboard.press('Enter');

  console.log("before waiting");
  await page.waitForTimeout(5000);
  console.log("after waiting");


  // await container.click()
  const lis = await page.$$('ul.items li') // all <li> element handles within the ul
  await lis[0].click()
 


  console.log("before waiting");
  await page.waitForTimeout(5000);
  console.log("after waiting");
  

  // Type into search box.
    

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
