import { convertValues, getCryptoPrice } from "./../services/crypto.services";
import { log } from "../lib/log";
import { getData } from "../services/data.services";

export const calculate = async (options: any) => {
  const { token, date } = options;

  const p = new Map();

  const getDataPromise = getData((data: any) => {
    const latestAmount = p.get(data.token) || 0;

    p.set(data.token, Number(latestAmount) + Number(data.amount));
  });

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

  log("+++++++++++++");
  Object.entries(convertedValue).forEach(([token, amount]) => {
    Object.entries(amount).forEach(([currency, value]) => {
      log(`${token} ${currency} ${value}`);
    });
  });

  console.log(convertedValue);
};
