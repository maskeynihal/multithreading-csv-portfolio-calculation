import csvParser from "csv-parser";
import { createReadStream } from "fs";
import { workerData, parentPort } from "worker_threads";
import app from "../config/app";
import { calculatePortfolio } from "./calculate.services";

(async () => {
  let loop = 0;
  let completedLoop = 0;
  const filters = workerData.filters;
  const result = new Map();

  await new Promise((resolve, reject) => {
    const startingIndex = workerData.starting * workerData.loop;
    const endingIndex = startingIndex + workerData.loop;

    for (
      let index = startingIndex + 1;
      index <= endingIndex && workerData.ending >= index;
      index++
    ) {
      loop++;

      createReadStream(`${app.portfolio.tmpFolder}/${index}.csv`)
        .pipe(csvParser())
        .on("data", (data) => calculatePortfolio(data, result, filters))
        .on("end", () => {
          completedLoop++;

          if (completedLoop === loop) {
            resolve(result);
          }
        })
        .on("error", reject);
    }
  });

  parentPort?.postMessage(result);
})();
