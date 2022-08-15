import csvParser from "csv-parser";
import { createReadStream } from "fs";

export const getData = (onData: any) => {
  const file = "transactions.csv";
  // const file = "transaction_2022_07_13.csv";

  return new Promise((resolve, reject) => {
    createReadStream(process.cwd() + ["", "data", file].join("/"))
      .pipe(csvParser())
      .on("ready", () => console.log(`Importing ${file}`))
      .on("data", onData)
      .on("end", async () => {
        resolve("done");
      })
      .on("error", async (err) => {
        reject(err);
      });
  });
};
