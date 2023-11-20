const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const fs = require("fs");
const jimp = require("jimp");

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080"],
  },
});

app.use(cors());
app.use(express.json());

const port = 3000;
const { ScanFiles, bigImage, modelName } = require("./scriptInProgress");
const { Console } = require("console");

// Обработчик события подключения клиента к серверу WebSocket
io.on("connection", (sock) => {
  console.log("SERVER a user connected");

  // Обработчик события 'myEvent'
  sock.on("myEvent", (someData) => {
    sock.emit("serverEvent", someData);
  });

  //Обработчик события 'startScript' с запуском асинхронного скрипта по обработке изображений
  sock.on("startScript", async (data) => {
    console.log("starting script by io event!", data);
    try {
      sock.emit("scriptRunning", true);
      // Деструктуризация данных из объекта data, полученного от клиента
      const {
        modelPath,
        imagePath,
        titleText,
        softScan = false,
        hardScan = true,
      } = data;
      console.log("SERVER Received modelPath: step1", modelPath);
      console.log("SERVER Received imagePath: step1", imagePath);
      let oldCache = null;
      // Проверка наличия файла кэша и его чтение, если он существует.
      let cache = [];
 

      // Формирование пути к файлу кэша (cachePath).
      const cachePath = imagePath + "/scan.json";

      if (fs.existsSync(cachePath)) {
        try {
          if (softScan === false && hardScan === true) {
            cache = [];
          }
          if (hardScan === false) {
            cache = JSON.parse(fs.readFileSync(cachePath).toString());
          }
        } catch (err) {
          console.log("SERVER reading cache error!", cachePath, err);
          cache = null;
        }
      }
      // обработка изображений из массива cache. Если кэш существует, циклом обрабатываются изображения из массива кэша (cache).
      let recached = [];

      if (cache) {
        try {
          for (let i = 0; i < cache.length; i++) {
            const tests = [
              // cache[i].path,
              modelPath + '/' + cache[i].model,
              modelPath + '/' + cache[i].model + '.zip',
              modelPath + '/' + cache[i].model + '.rar'
            ]
            const modelExists = tests.some(path => fs.existsSync(path))
            const imgExists = fs.existsSync(cache[i].path)
            if (!modelExists) {
              // model not exists anymore - skip this cached model
              continue
            }
            console.log('model exists', cache[i].model)
            // ok, model exists
            if (!imgExists) {
              //but img not exisdts, so we need run bigImage again for this cached model
              //so save it for now into temporary array to store such cached elements
              continue
            }
            // ok, we comes here, so model exists and img exists, just preparing data for frontend
            const img = await jimp.read(cache[i].path);
            const img64 = await img.getBase64Async(jimp.MIME_PNG);
            // Обработанные изображения добавляются в массив recached.
            // and save into 'recached' variable for future save into json cache file
            recached.push({
              ...cache[i],
              ready: true,
              image: img64,
            });
          }
        } catch (err) {
          console.log("problem", err);
        } 
      }
      // console.log('recached', recached)
      // Если не установлены флаги softScan и hardScan и кэш существует, результаты (массив recached) отправляются на клиент,
      // и событие 'scriptRunning' устанавливается в false.
      if (!softScan && !hardScan && cache) {
        sock.emit("modelsList", recached);
        sock.emit("scriptRunning", false);
        return;
      }

      // Формирование списка исключений (excluded) для функции ScanFiles. добавление scan.json в исключения
      const excluded = [
        ...(softScan && recached.length ? recached.map((el) => el.model) : []),
        "scan.json",
      ];
      console.log(excluded, "----------------------------------------------------------------");

      //Вызов функции ScanFiles для сканирования файлов в директории modelPath с исключениями. Результаты добавляются в массив modelsList.
      const modelsList = await ScanFiles(modelPath, excluded);
      console.log(modelsList, "SERVER models recieved, SCANFILE func going...");

      // Отправка события 'modelsList' с объединенным массивом изображений из кэша и новых моделей.
      sock.emit("modelsList", [...recached, ...modelsList]);
      console.log("SERVER open browser");

      //Вызов функции bigImage для выполнения дополнительных действий.Запись результата в файл кэша.
      const completeList = await bigImage(
        modelsList,
        imagePath,
        titleText,
        sock
      );

      // try {
      //   oldCache = JSON.parse(fs.readFileSync(cachePath).toString());
      //   console.log(oldCache, completeList, "@@@@@@@@@oldCache cashe ALL@@@@@@@@@");
      // } catch (e) {
      //   oldCache = null;
      // }
      // oldCache = [...(oldCache || []), ...completeList];
      const nextCache = [
        ...recached.map(el => ({ model: el.model, path: el.path, title: el.title})),
        ...completeList
      ]

      console.log(nextCache)
      fs.writeFileSync(cachePath, JSON.stringify(nextCache));
      console.log("SERVER ..wwait writing to json..");

      //Отправка события 'scriptRunning' с значением false.
      sock.emit("scriptRunning", false);
    } catch (err) {
      console.error(err);
    }
    console.log("SERVER FINISH");
  });
});

// Запуск HTTP-сервера на указанном порту.
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
