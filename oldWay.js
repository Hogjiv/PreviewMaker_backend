
// OPEN BIG IMAGE query search
async function oldWay(modelName, imagePath, socket) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();
  await page.goto("https://3ddd.ru/", { waitUntil: "load", timeout: 0 });
  await page.waitForSelector("#query_search", { timeout: 7000 });
  console.log("first value");

  let firstCycle = true 
  for (const model of modelName) {
    console.log(model, "step1, got name of model");

    // print by letters slowly (delay 100)

    const queryInputSelector = firstCycle ? '#query_search' : '.search input'
    if (firstCycle) firstCycle = false

    for (const character of model) {
      await page.type(queryInputSelector, character);
      await page.waitForTimeout(100);
    }
    console.log('step2, printing')
    // put value inside searchbar
    await page.keyboard.press("Enter");
    await page.waitForSelector(".link", { timeout: 10000 });

    // if any errors, continue run script
    try {
      await page.waitForSelector(".link", { timeout: 10000 });
    } catch (err) {
      await page.$eval(queryInputSelector, (input) => (input.value = ""));
      continue;
    }

    // идем на страницу
    const linkHref = await page.evaluate(() => {
      const linkElement = document.querySelector(".link");
      console.log("step3", linkElement.href);
      return linkElement.href;
    });


    // Переходим на страницу с полученной ссылкой
    try {
      await page.goto(linkHref, { waitUntil: "load", timeout: 0 });
      await page.waitForSelector(".big-view", { timeout: 10000 });
      console.log("step4,page opened");
      console.log("step5,big page open");
    } catch (error) {
      console.error("Error occurred during page navigation:", error);
    }
    console.log('!!')
 
    // открываем большую картинку
    const imageUrl = await page.$eval(".big-view img", (img) => img.src);
    console.log("step6",imageUrl);

    // make rule for create new image name
    const rxName = /\/(\d+\.[a-zA-Z0-9]+)/;
   
    //const imageNames = imageUrl.split(",");
    const imageNames = imageUrl.match(rxName)[1];
    console.log("step7, name of image got  successfully", imageNames);

    // make cycle for image name according regEx.
    const imageName = imageNames;
    console.log("step8, got names of images after rx", imageName);
    // make correct name inside saving folder
    const newImagePath = `${imagePath}/${imageName}.jpeg`;
    console.log("step9",newImagePath)
    // save image to correct path (newImagePath)
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer", 
        timeout: 30000,
      });
      fs.writeFileSync(newImagePath, response.data);
      console.log("step10, Image saved successfully.");
    } catch (error) {
      console.error("Error saving image:", error);
    }
    console.log(page.url())
    // ВЫДЕЛИТЬ СТРОКУ ПОИСКА И ПОМЕСТИТЬ НОВОЕ
    // clear search string
   await page.$eval('.search input', (input) => (input.value = ''));
   console.log('the string is empty')
  }
  await browser.close();
  console.log("Done! open2");
}
