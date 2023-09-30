const express = require("express");
const cors = require("cors");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const fs = require("fs")
const jimp = require("jimp");

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080"]
  }
});

app.use(cors());
app.use(express.json());

const port = 3000;
const { ScanFiles, bigImage } = require("./scriptInProgress");

io.on('connection', (sock) => {
  console.log('SERVER a user connected');
   sock.on('myEvent', (someData) => {
     console.log('SERVER event from UI came', someData)
     sock.emit('serverEvent', someData)
   })
  sock.on('startScript', async data => {
    console.log('starting script by io event!', data)
    try {
      sock.emit('scriptRunning', true)
      // take paths for save images and take models
      const { modelPath, imagePath, smallPreview, titleText, softScan = false, hardScan = true } = data
      console.log("SERVER Received modelPath: step1", modelPath);
      console.log("SERVER Received imagePath: step1", imagePath);
 
      const cachePath = imagePath + '/scan.json';
      console.log(cachePath, 'SERVER !!')
      let cache = null;

      if (fs.existsSync(cachePath)) {
        try {
          cache = JSON.parse(fs.readFileSync(cachePath).toString())
        } catch (err) {
          console.log('SERVER reading cache error!', cachePath, err)
          cache = null
        }
      }
 
     
      const recached = []
      if (cache) {
        for (let i = 0; i < cache.length; i++) {
          const img = await jimp.read(cache[i].path)
          const img64 = await img.getBase64Async(jimp.MIME_PNG)
          recached.push({
            ...cache[i],
            ready: true,
            image: img64
          })
        }
      }
      if (!softScan && !hardScan && cache) {
        sock.emit('modelsList', recached)
        sock.emit('scriptRunning', false)
        return
      }

     // добавление scan.json в исключения
     const excluded = [...(softScan && cache ? cache.map(el => el.model) : []), 'scan.json'];

      const modelsList =  await ScanFiles (modelPath, excluded) 
      console.log(modelsList, "SERVER models recieved, SCANFILE func going...")

      sock.emit('modelsList', [...recached, ...modelsList])
      console.log('SERVER here is emit cached in Script')
  
      // BIG OR SMALL PREVIEW?
      console.log('SERVER open browser')
      const completeList = await bigImage(modelsList, imagePath, smallPreview, titleText, sock)

      // JSON writing
      let old = null
      try { 
        old = JSON.parse(fs.readFileSync(cachePath).toString())
        console.log(old, completeList, "!!!!!????!!!!!")
      } 
      catch(e) { 
        old = null
      }
      
      old = [...(old || []), ...completeList]
      fs.writeFileSync(cachePath, JSON.stringify(old))
      console.log('SERVER ..wwait writing to json..')
      sock.emit('scriptRunning', false)
    } catch (err) {
      console.error(err);
      //res.status(500).send("Can't make preview");
    }
    console.log('SERVER FINISH')
  })
});


// const fnStart = async () => {
//   ScanFiles((err, modelName) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log(modelName);
//   });
//   // body of fn1 method
// };


// app.get("/", (req, res) => {
//   console.log("GET /");
//   res.send("Hello World!");
// });

// app.get("/api/images", (req, res) => {
//   console.log("GET /api/images");
//   res.json(images);
// });

// app.get("/api/start", async (req, res) => {
//   const fnResult = await fnStart();
//   res.json(fnResult);
// });


//SCRIPT  
// app.post("/api/script", async (req, res) => {
//   try {
//     // take paths for save images and take models
//     const modelPath = req.body.modelPath;
//     const imagePath = req.body.imagePath;

//     console.log("Received modelPath: step1", modelPath);
//     console.log("Received imagePath: step1", imagePath);
//     res.json(req.body);

//     const modelName =  await ScanFiles (modelPath) 
//     console.log(modelName, "step 1, models recieved")

//     OpenBrowser2(modelName, imagePath)
//     console.log('step2, open browser')

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Can't make preview");
//   }
// });



server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
