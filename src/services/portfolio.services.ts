import csvParser from "csv-parser";
import { createReadStream, createWriteStream, statSync } from "fs";
import { Transform } from "stream";
import { Worker } from "worker_threads";
import { cpus } from "os";
import app from "../config/app";
import { fileSplitter } from "./file.services";

export const getData = async (onData: any): Promise<Map<string, any>> => {
  const result = new Map();

  return await new Promise((resolve, reject) => {
    createReadStream(app.portfolio.filePath)
      .pipe(csvParser())
      .on("data", (data) => onData(data, result))
      .on("end", () => {
        resolve(result);
      })
      .on("error", reject);
  });
};

export const getNewAmountAccordingToTransactionType = ({
  amount,
  latestAmount,
  transactionType,
}: {
  amount: number;
  latestAmount: number;
  transactionType: "DEPOSIT" | "WITHDRAWAL";
}) => {
  if (transactionType === "DEPOSIT") {
    return amount + latestAmount;
  }

  return latestAmount - amount;
};

export const getDataWithThreads = async (filters: {
  token?: string;
  date?: string;
}): Promise<Map<string, any>> => {
  const filePath = app.portfolio.filePath;

  const minBufferSize = 1024 * 1024;
  const stats = statSync(filePath);
  const fileSize = stats.size;
  const maxThread = cpus().length;
  const bufferSize =
    minBufferSize > fileSize ? fileSize : Math.ceil(fileSize / maxThread);
  const totalFiles = Math.ceil(fileSize / bufferSize);

  const thread = totalFiles > maxThread ? maxThread : totalFiles;

  await new Promise((resolve, reject) => {
    createReadStream(filePath, {
      highWaterMark: bufferSize,
    })
      .pipe(fileSplitter({ totalFiles }))
      .on("data", (data) => data)
      .on("end", async () => {
        resolve("done");
      })
      .on("error", reject);
  });

  return new Promise((resolve, reject) => {
    const final = new Map();
    const completedWorkerId: any = [];

    const division = Math.ceil(totalFiles / thread);

    for (let i = 0; i < thread; i++) {
      const worker = new Worker(
        process.cwd() + "/dist/src/services/calculate.portfolio.services.js",
        {
          workerData: {
            i,
            loop: division,
            starting: i,
            ending: totalFiles,
            filters,
          },
        }
      );

      worker.on("message", (data) => {
        [...data.keys()].forEach((key) => {
          final.set(key, data.get(key) + (final.get(key) || 0));
        });

        completedWorkerId.push(worker.threadId);

        worker.terminate();
      });

      worker.on("exit", () => {
        if (completedWorkerId.length === thread) {
          resolve(final);
        }
      });

      worker.on("error", reject);
    }
  });
};
