import { convertValues, getCryptoPrice } from "./../services/crypto.services";
import { log } from "../lib/log";
import {
  getData,
  getNewAmountAccordingToTransactionType,
} from "../services/portfolio.services";
import Table from "cli-table3";

export const calculate = async (options: any) => {
  const { token, date } = options;

  const p = new Map();

  const getDataPromise = getData(
    (data: {
      amount: number;
      token: string;
      transaction_type: "DEPOSIT" | "WITHDRAWAL";
    }) => {
      const latestAmount = p.get(data.token) || 0;

      const newAmount = getNewAmountAccordingToTransactionType({
        amount: Number(data.amount),
        latestAmount: Number(latestAmount),
        transactionType: data.transaction_type,
      });

      p.set(data.token, newAmount);
    }
  );

  const cryptoPricePromise = token ? getCryptoPrice([token]) : null;

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
};
