import { table } from "../lib/log";

export const printPortfolio = (
  result = new Map(),
  convertedValue: Record<string, Record<string, number>> = {}
) => {
  const headers = new Set(["S.N", "Token", "Amount"]);

  const values: Array<{ sn: number; token: string; amount: number }> = [];

  let index = 1;

  Object.entries(convertedValue).forEach(([token, amount]) => {
    let a = {
      sn: index,
      token,
      amount: result.get(token),
    };

    Object.entries(amount).forEach(([currency, value]) => {
      a = { ...a, [currency]: value };

      headers.add(currency);
    });

    index++;

    values.push(a);
  });

  table({
    head: [...headers].map((header) => header.toUpperCase()),
    style: {
      head: ["cyan"],
    },
    body: values.map((v) => [...Object.values(v)]),
  });
};
