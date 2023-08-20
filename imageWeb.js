const puppeteer = require("puppeteer");

 
// big view

/* (async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto(
    "https://3ddd.ru/3dmodels/show/tape_cord_armchair_outdoor_by_minotti",
    { waitUntil: "load", timeout: 0 }
  );

  // const imageUrl = page.$eval(".container img", img => img.src)
  // const imageUrl = await page.$eval(".big-view-img .big-view  img", (img) => img.src);
  // get image from web
  await page.waitForSelector(".big-view-img");
  const imageUrl = await page.$eval(".big-view-img", (img) => img.src);
  console.log(imageUrl);
})();
*/
//small view
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto(
    "https://3ddd.ru/search?query=2769921.5e81895a11c2e",
    { waitUntil: "load", timeout: 0 }
  );

  await page.waitForSelector(".item");
  console.log('wait selector done')
  const imageUrl = await page.$eval(".item img", (img) => img.src);
  console.log('image url done')
  console.log(imageUrl);
})();
