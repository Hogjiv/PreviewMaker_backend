
const fs = require('fs');
const path  = './models' 

// get names of files
function nameFolder () {
  fs.readdir(path, (err, data) => {
    if (err) throw err;
    const fileNames = data
    console.log(fileNames);
  });
}
 
module.exports = { nameFolder }