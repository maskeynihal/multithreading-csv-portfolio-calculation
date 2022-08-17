import csvParser from "csv-parser";
import { createReadStream } from "fs";
import { workerData, parentPort } from "worker_threads";
import app from "../config/app";
import { isSameDay } from "../lib/date";
import { calculatePortfolio } from "./calculate.services";
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
