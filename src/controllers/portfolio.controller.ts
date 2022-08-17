import { convertValues, getCryptoPrice } from "./../services/crypto.services";
import { log } from "../lib/log";
import {
  getData,
  getDataWithThreads,
  getNewAmountAccordingToTransactionType,
} from "../services/portfolio.services";
import Table from "cli-table3";
import { formatDate, isSameDay, isValidDate } from "../lib/date";
import db from "../lib/db";

export const calculate = async (options: any) => {
  const { token, date } = options;

  if (date && !isValidDate(date)) {
    throw new Error("Invalid date");
  }

  const p = new Map();

  const getDataPromise = getData(
    async (data: {
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
    }
  );

  const cryptoPricePromise = token ? getCryptoPrice([token]) : null;

  try {
    let [_, cryptoPrice] = await Promise.all([
      getDataPromise,
      cryptoPricePromise,
    ]);

    let convertedValue: Record<string, Record<string, number>> = {};

    if (!token) {
      cryptoPrice = await getCryptoPrice(Array.from(p.keys()));

      convertedValue = convertValues(Object.fromEntries(p), cryptoPrice);
    } else {
      convertedValue = convertValues({ [token]: p.get(token) }, cryptoPrice);
    }

    const headers = new Set(["S.N", "Token", "Amount"]);
    const body = [];

    const values: Array<{ sn: number; token: string; amount: number }> = [];
    let index = 1;

    Object.entries(convertedValue).forEach(([token, amount]) => {
      let a = {
        sn: index,
        token,
        amount: p.get(token),
      };

      Object.entries(amount).forEach(([currency, value]) => {
        a = { ...a, [currency]: value };

        headers.add(currency);
      });

      index++;

      values.push(a);
    });

    const table = new Table({
      head: [...headers].map((header) => header.toUpperCase()),
      style: {
        head: ["cyan"],
      },
    });

    values.forEach((v) => {
      table.push([...Object.values(v)]);
    });

    log(table.toString());
  } catch (error) {
    console.log(error);
  }
};

export const calculateWithMultiThread = async (options: any) => {
  const { token, date } = options;

  if (date && !isValidDate(date)) {
    throw new Error("Invalid date");
  }

  const p = new Map();

  const getDataPromise = getDataWithThreads();

  const cryptoPricePromise = token ? getCryptoPrice([token]) : null;

  try {
    let [p, cryptoPrice] = await Promise.all([
      getDataPromise,
      cryptoPricePromise,
    ]);

    let convertedValue: Record<string, Record<string, number>> = {};

    if (!token) {
      cryptoPrice = await getCryptoPrice(Array.from(p.keys()));

      convertedValue = convertValues(Object.fromEntries(p), cryptoPrice);
    } else {
      convertedValue = convertValues({ [token]: p.get(token) }, cryptoPrice);
    }

    const headers = new Set(["S.N", "Token", "Amount"]);
    const body = [];

    const values: Array<{ sn: number; token: string; amount: number }> = [];
    let index = 1;

    Object.entries(convertedValue).forEach(([token, amount]) => {
      let a = {
        sn: index,
        token,
        amount: p.get(token),
      };

      Object.entries(amount).forEach(([currency, value]) => {
        a = { ...a, [currency]: value };

        headers.add(currency);
      });

      index++;

      values.push(a);
    });

    const table = new Table({
      head: [...headers].map((header) => header.toUpperCase()),
      style: {
        head: ["cyan"],
      },
    });

    values.forEach((v) => {
      table.push([...Object.values(v)]);
    });

    log(table.toString());
  } catch (error) {
    console.log(error);
  }
};
