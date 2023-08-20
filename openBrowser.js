

async function OpenBrowser(modelName, imagePath, socket) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();
  await page.goto("https://3ddd.ru/", { waitUntil: "load", timeout: 0 });
  await page.waitForSelector("#query_search", { timeout: 7000 });
  console.log("first value");

  for (const model of modelName) {
    console.log(model, "got name of model");

    // print by letters slowly (delay 100)
    for (const character of model) {
      await page.type("#query_search", character);
      await page.waitForTimeout(100);
    }
    // put value inside searchbar
    await page.keyboard.press("Enter");
    await page.waitForSelector(".link", { timeout: 10000 });

    // if any errors, continue run script
    try {
      await page.waitForSelector(".link", { timeout: 10000 });
    } catch (err) {
      await page.$eval("#query_search", (input) => (input.value = ""));
      continue;
    }
    // получаем ссылку на новую страницу с моделью для большого превью
    /*const linkHref = await page.evaluate(() => {
   const linkElement = document.querySelector(".link");
   console.log('browserSTEP1', linkElement.href)
   return linkElement.href;
   });
 
  
  
  // Переходим на страницу с полученной ссылкой
 await page.goto(linkHref, { waitUntil: "load", timeout: 0 }); 
  await page.waitForSelector(".link", { timeout: 10000 });
  console.log( "page opened")
 */

    /*
    // MAKE BIG PREVIEW
    // find correct css class in 3ddd for small image
    //const imageUrl = await page.$eval(".link img", (img) => img.src);
   
      // save image to correct path (imagePat)
    //const imageUrl = await page.$eval(".link img", (img) => img.src);
    const imageUrl = await page.$eval(".wrap-image-big-view img", (img) => img.src);
    console.log(imageUrl, 'class found'); 
    console.log("!!!!!!!!!!!!!!!!!!!!")
    return
    // make rule for create new image name
    const rxName = /[^/]+$/;
    const imageNames = imageUrl.split(",");
    console.log(imageNames)
 

    // make cycle for image name according regEx. 
    for (const imageName of imageNames) {
      const newName = imageName.match(rxName);

      console.log(newName, 'step2, got names of images');
      
      // make correct name inside saving folder 
      const newImagePath = imagePath + '/' + newName[0];  
      console.log(newImagePath)
     
      // save image to correct path (imagePat)
      try {
        const response = await axios.get(imageName, { responseType: 'arraybuffer' });
        fs.writeFileSync(newImagePath, response.data);
        console.log('Image saved successfully.');
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }

    // clear search string
    await page.$eval("#query_search", (input) => (input.value = ''));
    console.log('the string is empty')
    */

    // MAKE SMALL PREVIEW working
    // find correct css class in 3ddd for small image
    const imageUrl = await page.$eval(".link img", (img) => img.src);

    console.log(imageUrl, "step1");

    // make rule for create new image name
    const rxName = /[^/]+$/;
    const imageNames = imageUrl.split(",");

    // make cycle for image name according regEx.
    for (const imageName of imageNames) {
      const newName = imageName.match(rxName);

      console.log(newName, "step2, got names of images");

      // make correct name inside saving folder
      const newImagePath = imagePath + "/" + newName[0];

      // save image to correct path (imagePat)
      try {
        const response = await axios.get(imageName, {
          responseType: "arraybuffer",
        });
        fs.writeFileSync(newImagePath, response.data);
        console.log("Image saved successfully.");
      } catch (error) {
        console.error("Error saving image:", error);
      }
    }

    // clear search string
    await page.$eval("#query_search", (input) => (input.value = ""));
    console.log("the string is empty");
  }
  await browser.close();
  console.log("Done!");
}