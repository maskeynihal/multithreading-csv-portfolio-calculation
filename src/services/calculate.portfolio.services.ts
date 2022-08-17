import csvParser from "csv-parser";
import { createReadStream } from "fs";
import { workerData, parentPort } from "worker_threads";
import { isSameDay } from "../lib/date";
import { getNewAmountAccordingToTransactionType } from "./portfolio.services";

const token = null;
const date = null;
const p = new Map();

const calculateAmount = async (data: {
  amount: number;
  token: string;
  transaction_type: "DEPOSIT" | "WITHDRAWAL";
  timestamp: number;
}) => {
  const latestAmount = p.get(data.token) || 0;

  p.set(data.token, latestAmount);

  if (token && date) {
    if (
      data.token !== token ||
      !isSameDay(new Date(data.timestamp), new Date(date))
    ) {
      return;
    }

    const newAmount = getNewAmountAccordingToTransactionType({
      amount: Number(data.amount || 0),
      latestAmount: Number(latestAmount || 0),
      transactionType: data.transaction_type,
    });

    p.set(data.token, newAmount);

    return;
  }

  if (token) {
    if (token !== data.token) {
      return;
    }

    const newAmount = getNewAmountAccordingToTransactionType({
      amount: Number(data.amount || 0),
      latestAmount: Number(latestAmount || 0),
      transactionType: data.transaction_type,
    });

    p.set(data.token, newAmount);
    return;
  }

  if (date) {
    if (!isSameDay(new Date(data.timestamp), new Date(date))) {
      return;
    }

    const newAmount = getNewAmountAccordingToTransactionType({
      amount: Number(data.amount || 0),
      latestAmount: Number(latestAmount || 0),
      transactionType: data.transaction_type,
    });

    p.set(data.token, newAmount);
    return;
  }

  const newAmount = getNewAmountAccordingToTransactionType({
    amount: Number(data.amount || 0),
    latestAmount: Number(latestAmount || 0),
    transactionType: data.transaction_type,
  });

  p.set(data.token, newAmount);
};

let loop = 0;
let completedLoop = 0;

(async () => {
  await new Promise((resolve, reject) => {
    const startingIndex = workerData.starting * workerData.loop;
    const endingIndex = startingIndex + workerData.loop;

    for (
      let index = startingIndex + 1;
      index <= endingIndex && workerData.ending >= index;
      index++
    ) {
      loop++;
      createReadStream(
        process.cwd() + ["", "data", "tmp", `${index}.csv`].join("/")
      )
        .pipe(csvParser())
        .on("data", calculateAmount)
        .on("end", () => {
          completedLoop++;

          if (completedLoop === loop) {
            resolve("done");
          }
        });
    }
  });

  parentPort?.postMessage(p);
})();
