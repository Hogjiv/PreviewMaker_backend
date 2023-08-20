const { ScanFiles, OpenBrowser } = require("./scriptInProgress");
// find path in PC
const pathOnPc = "D:/Ira/job/Exterior/model";
// const ScanFiles = require("./scriptInProgress");
/* ScanFiles(pathOnPc, (err, modelName) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(modelName, "recived")
});
*/

try {
  const modelName = await ScanFiles(pathOnPc)
  await OpenBrowser()
} catch (err) {
  // console.error('SCAN FILES ERRROR', err)
// }

// try {
  // await OpenBrowser()
// } catch (err) {
  // console.error('OPEN BROWSER ERROR', err);
  console.error('SCAN OR OPEN BROWSER ERROR', err);
};

/*
OpenBrowser((err, result) => {
  if (err) {
    console.error("Error opening browser:", err);
    return;
  }
  console.log(result);
 
setTimeout(() => {
  console.log('browser is open');
}, 2000)    
});
*/
