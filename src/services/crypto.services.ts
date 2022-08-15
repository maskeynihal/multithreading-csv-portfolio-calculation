import api from "../lib/api";
import { buildUrl } from "./../utils/string";
import endpoints from "../constants/endpoints";

export const getCryptoPrice = (
  from: Array<string> = [],
  to: Array<string> = ["USD", "NPR"]
) => {
  return from.length > 1
    ? getMultipleSymbolPrice(from, to)
    : getSingleSymbolPrice(from.join(","), to);
};

export const getSingleSymbolPrice = (from: string, to: Array<string>) => {
  const url = buildUrl(
    endpoints.crypto.base,
    endpoints.crypto.singleSymbolPrice
  );

  return api
    .get(url, {
      params: {
        fsym: from,
        tsyms: to.join(","),
      },
    })
    .then(({ data }) => ({ [from]: data }));
};

export const getMultipleSymbolPrice = (
  from: Array<string>,
  to: Array<string>
) => {
  const url = buildUrl(
    endpoints.crypto.base,
    endpoints.crypto.multipleSymbolPrice
  );

  return api
    .get(url, {
      params: {
        fsyms: from.join(","),
        tsyms: to.join(","),
      },
    })
    .then(({ data }) => data);
};

export const convertValues = (
  balance: Record<string, number>,
  conversion: Record<string, Record<string, number>>
) => {
  const convertedBalance: Record<
    string,
    Record<keyof typeof conversion, number>
  > = {};

  for (const [token, amount] of Object.entries(balance)) {
    convertedBalance[token] = {};
    for (const [currency, value] of Object.entries(conversion[token])) {
      convertedBalance[token][currency] = amount * value;
    }
  }

  return convertedBalance;
};
