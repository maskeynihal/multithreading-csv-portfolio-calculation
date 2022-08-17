import csvParser from "csv-parser";
import { createReadStream, createWriteStream, statSync } from "fs";
import { Transform } from "stream";
import { Worker } from "worker_threads";
import { cpus } from "os";

const fileSplitter = (options: { totalFiles: number }) => {
  let totalFilesCreated = 0;

  const { totalFiles } = options;

  const transformer = new Transform();

  let trailing: any;
  let headers: any;

  transformer._transform = (data, encoding, cb) => {
    totalFilesCreated++;
    let firstData = data;

    const write = createWriteStream(
      process.cwd() + ["", "data", "tmp", `${totalFilesCreated}.csv`].join("/")
    );

    if (trailing) {
      const newBuffer = Buffer.concat([headers, trailing, data]);

      if (totalFilesCreated >= totalFiles) {
        firstData = newBuffer;
        trailing = null;
      } else {
        firstData = newBuffer.slice(0, newBuffer.lastIndexOf("\n"));
        trailing = newBuffer.slice(newBuffer.lastIndexOf("\n"));
      }
    } else {
      if (totalFilesCreated >= totalFiles) {
        firstData = data;
        trailing = null;
      } else {
        headers = data.slice(0, data.indexOf("\n"));
        firstData = data.slice(0, data.lastIndexOf("\n"));
        trailing = data.slice(data.lastIndexOf("\n"));
      }
    }
    write.write(firstData);

    cb(null, firstData);
  };

  return transformer;
};

export const getData = async (onData: any) => {
  // const file = "tmp/1.csv";
  const file = "transactions.csv";
  // const file = "transaction_2022_07_13.csv";

  await new Promise((resolve, reject) => {
    createReadStream(process.cwd() + ["", "data", file].join("/"))
      .pipe(csvParser())
      .on("open", () => console.log(`Opening ${file}`))
      .on("ready", () => console.log(`Importing ${file}`))
      .on("data", onData)
      .on("end", async () => {
        resolve("done");
      })
      .on("error", async (err) => {
        reject(err);
      });
  });

  console.log("DONE");
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

export const getDataWithThreads = async (): Promise<Map<string, any>> => {
  const file = "transactions.csv";
  // const file = "transaction_2022_07_13.csv";

  const filePath = process.cwd() + ["", "data", file].join("/");

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
      .on("open", () => console.log(`Opening ${file}`))
      .on("ready", () => console.log(`Importing ${file}`))
      .on("data", (data) => data)
      .on("end", async () => {
        resolve("done");
      })
      .on("error", async (err) => {
        reject(err);
      });
  });

  return new Promise((resolve, reject) => {
    const final = new Map();
    const completedWorkerId: any = [];

    const division = Math.ceil(totalFiles / thread);

    for (let i = 0; i < thread; i++) {
      const worker = new Worker(
        process.cwd() + "/dist/src/services/calculate.portfolio.services.js",
        {
          workerData: { i, loop: division, starting: i, ending: totalFiles },
        }
      );

      worker.on("error", (err) => console.log(err));

      worker.on("message", (data) => {
        [...data.keys()].forEach((key) => {
          final.set(key, data.get(key) + (final.get(key) || 0));
        });

        completedWorkerId.push(worker.threadId);

        worker.terminate();

        if (completedWorkerId.length === thread) {
          resolve(final);
        }
      });
    }
  });
};
