import en from "../lang/en";
import loader from "../lib/loader";
import { handleError } from "../utils/error";
import { printPortfolio } from "../services/print.services";
import { calculatePortfolio } from "../services/calculate.services";
import { getData, getDataWithThreads } from "../services/portfolio.services";
import { convertValues, getCryptoPrice } from "./../services/crypto.services";
import {
  IPortfolioOptions,
  PortfolioOptions,
} from "./../validations/portfolio.validation";

export type IConvertedValue = Record<string, Record<string, number>>;

export const calculate = async (options: IPortfolioOptions) => {
  try {
    PortfolioOptions.parse(options);

    const { token, date } = options;

    const spinner = loader("Calculating portfolio");

    spinner.start();

    const getDataPromise = getData((data: any, result: any) =>
      calculatePortfolio(data, result, { token, date })
    );
    const cryptoPricePromise = token ? getCryptoPrice([token]) : null;

    let [result, cryptoPrice] = await Promise.all([
      getDataPromise,
      cryptoPricePromise,
    ]);

    let convertedValue: IConvertedValue = {};

    if (!token) {
      cryptoPrice = await getCryptoPrice(Array.from(result.keys()));
    }

    convertedValue = convertValues(
      token ? { [token]: result.get(token) } : Object.fromEntries(result),
      cryptoPrice
    );

    spinner.stop();

    printPortfolio(result, convertedValue);
  } catch (error) {
    console.log(error);
  }
};

export const calculateWithMultiThread = async (options: IPortfolioOptions) => {
  const mainSpinner = loader(en.calculate.portfolio);
  mainSpinner.start();

  try {
    PortfolioOptions.parse(options);

    const { token } = options;

    const getDataPromise = getDataWithThreads(options).then((data) => {
      mainSpinner.text = en.converting.balance;

      return data;
    });

    const cryptoPricePromise = token
      ? getCryptoPrice([token]).then((data) => {
          mainSpinner.text = en.finalize.portfolio;

          return data;
        })
      : null;

    let [portfolioData, cryptoPrice] = await Promise.all([
      getDataPromise,
      cryptoPricePromise,
    ]);

    if (!token) {
      cryptoPrice = await getCryptoPrice(Array.from(portfolioData.keys()));
    }

    const balance = token
      ? { [token]: portfolioData.get(token) || 0 }
      : Object.fromEntries(portfolioData);

    const convertedValue = convertValues(balance, cryptoPrice);

    mainSpinner.succeed(en.calculated.portfolio);

    printPortfolio(portfolioData, convertedValue);
  } catch (error) {
    mainSpinner.fail(en.error.calculation);

    handleError(error);
  }
};
