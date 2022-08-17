import api, { get } from "../lib/api";
import { buildUrl } from "./../utils/string";
import endpoints from "../constants/endpoints";

const MINIMUM_FROM_LENGTH = 1;

export type IConversion = Record<string, Record<string, number>>;
export type IBalance = Record<string, number>;
export type IConvertedBalance<T extends string | number> = Record<
  string,
  Record<T, number>
>;

export const getCryptoPrice = (
  from: Array<string> = [],
  to: Array<string> = ["USD"]
) => {
  return from.length > MINIMUM_FROM_LENGTH
    ? getMultipleSymbolPrice(from, to)
    : getSingleSymbolPrice(from.join(","), to);
};

export const getSingleSymbolPrice = (from: string, to: Array<string>) => {
  const url = buildUrl(
    endpoints.crypto.base,
    endpoints.crypto.singleSymbolPrice
  );

  return get(url, {
    params: {
      fsym: from,
      tsyms: to.join(","),
    },
  }).then((data) => ({ [from]: data }));
};

export const getMultipleSymbolPrice = (
  from: Array<string>,
  to: Array<string>
) => {
  const url = buildUrl(
    endpoints.crypto.base,
    endpoints.crypto.multipleSymbolPrice
  );

  return get(url, {
    params: {
      fsyms: from.join(","),
      tsyms: to.join(","),
    },
  });
};

export const convertValues = (balance: IBalance, conversion: IConversion) => {
  const convertedBalance: IConvertedBalance<keyof typeof conversion> = {};

  for (const [token, amount] of Object.entries(balance)) {
    convertedBalance[token] = {};

    for (const [currency, value] of Object.entries(conversion[token])) {
      convertedBalance[token][currency] = amount * value;
    }
  }

  return convertedBalance;
};
