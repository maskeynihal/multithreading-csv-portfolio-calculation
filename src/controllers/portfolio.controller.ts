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
import { calculatePortfolio } from "../services/calculate.services";
import { printPortfolio } from "../services/print.services";

export const calculate = async (options: any) => {
  const { token, date } = options;

  if (date && !isValidDate(date)) {
    throw new Error("Invalid date");
  }

  const getDataPromise = getData((data: any, result: any) =>
    calculatePortfolio(data, result, { token, date })
  );

  const cryptoPricePromise = token ? getCryptoPrice([token]) : null;

  try {
    let [result, cryptoPrice] = await Promise.all([
      getDataPromise,
      cryptoPricePromise,
    ]);

    let convertedValue: Record<string, Record<string, number>> = {};

    if (!token) {
      cryptoPrice = await getCryptoPrice(Array.from(result.keys()));

      convertedValue = convertValues(Object.fromEntries(result), cryptoPrice);
    } else {
      convertedValue = convertValues(
        { [token]: result.get(token) },
        cryptoPrice
      );
    }

    printPortfolio(result, convertedValue);
  } catch (error) {
    console.log(error);
  }
};

export const calculateWithMultiThread = async (options: any) => {
  const { token, date } = options;

  if (date && !isValidDate(date)) {
    throw new Error("Invalid date");
  }

  const getDataPromise = getDataWithThreads(options);

  const cryptoPricePromise = token ? getCryptoPrice([token]) : null;

  try {
    let [result, cryptoPrice] = await Promise.all([
      getDataPromise,
      cryptoPricePromise,
    ]);

    let convertedValue: Record<string, Record<string, number>> = {};

    if (!token) {
      cryptoPrice = await getCryptoPrice(Array.from(result.keys()));

      convertedValue = convertValues(Object.fromEntries(result), cryptoPrice);
    } else {
      convertedValue = convertValues(
        { [token]: result.get(token) },
        cryptoPrice
      );
    }

    printPortfolio(result, convertedValue);
  } catch (error) {
    console.log(error);
  }
};
