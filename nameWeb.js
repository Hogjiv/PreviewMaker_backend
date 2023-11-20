const puppeteer = require("puppeteer");
const pathForSaveImage = "D:/Ira/models";
const fs = require('fs');
const axios = require('axios');

// find path in PC
const pathOnPc = "D:/Ira/models";

// function go() {
  fs.readdir(pathOnPc, async (err, files) => {
    if (err) throw err;
      // read files according regExp  
      console.log(files, "2");
    const filteredFiles = files.filter(str => str.endsWith('.rar') || ('.zip'));
    console.log(filteredFiles, '!!!')

    const replacedFiles = filteredFiles.map(file => file.replace(/\.rar$|\.zip$/, ""));
    const modelName = replacedFiles.map(element => element.split(" "));
    const modelCounter = modelName.reduce((count, element) => count + element.length, 0)
    console.log(modelName, "total read" + modelCounter);

    // open browser
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      userDataDir: "./tmp",
    });
    const page = await browser.newPage();

    await page.goto(
      "https://3ddd.ru/",
      { waitUntil: "load", timeout: 0 }
    );
    // put first value
    await page.waitForSelector("#query_search");
    console.log('selector')


    // create cycle
    for (const model of modelName) {
      console.log(model);

       // print by letters slowly (delay 100)
      for (const character of model) {
        await page.type("#query_search", character);
        await page.waitForTimeout(100);
      }
      

      // put value inside searchbar
      await page.keyboard.press("Enter");
      // if any errors, continue run script
      try {
        await page.waitForSelector(".link", { timeout: 10000 });
      } catch (err) {
        await page.$eval("#query_search", (input) => (input.value = ''));
        continue
      }

      // find correct css class in 3ddd
      const imageUrl = await page.$eval(".link img", (img) => img.src);

      console.log(imageUrl, 'step1');

      // make rule for create new image name
      const rxName = /[^/]+$/;
      const imageNames = imageUrl.split(",");

    
      // make cycle for image name according regEx. 
      for (const imageName of imageNames) {
        const newName = imageName.match(rxName);

        console.log(newName, 'step2, got names of images');

        // make correct name inside saving foldCacheer 
        const imagePath = pathForSaveImage + '/' + newName[0];
    
        // save image to correct path (imagePat)
        try {
          const response = await axios.get(imageName, { responseType: 'arraybuffer' });
          fs.writeFileSync(imagePath, response.data);
          console.log('Image saved successfully.');
        } catch (error) {
          console.error('Error saving image:', error);
        }
      }

      // clear search string
      await page.$eval("#query_search", (input) => (input.value = ''));
      console.log('the string is empty')
    } 

    await browser.close();
    console.log("Done!")
  });

// }

// module.exports = go