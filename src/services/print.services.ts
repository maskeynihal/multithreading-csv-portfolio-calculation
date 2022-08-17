import { IConvertedValue } from "../controllers/portfolio.controller";
import { table } from "../lib/log";
import { IFinalBalance } from "./portfolio.services";

// TODO: Add dynamic key definition for dynamic currency conversion
export interface ITableRow {
  sn: number;
  token: string;
  amount: number;
}

export const printPortfolio = (
  result: IFinalBalance = new Map(),
  convertedValue: IConvertedValue = {}
) => {
  const headers = new Set(["S.N", "Token", "Amount"]);

  const values: Array<ITableRow> = [];

  let loop = 0;

  Object.entries(convertedValue).forEach(([token, amount]) => {
    loop++;
    let currentAmount = {};

    Object.entries(amount).forEach(([currency, value]) => {
      currentAmount = { ...currentAmount, [currency]: value };

      headers.add(currency);
    });

    values.push({
      sn: loop,
      token,
      amount: result.get(token) || 0,
      ...currentAmount,
    });
  });

  table({
    head: [...headers].map((header) => header.toUpperCase()),
    style: {
      head: ["cyan"],
    },
    body: values.map((v) => [...Object.values(v)]),
  });
};
