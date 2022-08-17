import { isSameDay } from "../lib/date";
import { getNewAmountAccordingToTransactionType } from "./portfolio.services";

export const calculatePortfolio = async (
  data: {
    amount: number;
    token: string;
    transaction_type: "DEPOSIT" | "WITHDRAWAL";
    timestamp: number;
  },
  result: Map<string, any>,
  filters: { token?: string; date?: string } = {}
): Promise<Map<string, any>> => {
  const { token, date } = filters;
  const latestAmount = result.get(data.token) || 0;

  result.set(data.token, latestAmount);

  if (token && date) {
    if (
      data.token !== token ||
      !isSameDay(new Date(data.timestamp), new Date(date))
    ) {
      return result;
    }

    const newAmount = getNewAmountAccordingToTransactionType({
      amount: Number(data.amount || 0),
      latestAmount: Number(latestAmount || 0),
      transactionType: data.transaction_type,
    });

    result.set(data.token, newAmount);

    return result;
  }

  if (token) {
    if (token !== data.token) {
      return result;
    }

    const newAmount = getNewAmountAccordingToTransactionType({
      amount: Number(data.amount || 0),
      latestAmount: Number(latestAmount || 0),
      transactionType: data.transaction_type,
    });

    result.set(data.token, newAmount);
    return result;
  }

  if (date) {
    if (!isSameDay(new Date(data.timestamp), new Date(date))) {
      return result;
    }

    const newAmount = getNewAmountAccordingToTransactionType({
      amount: Number(data.amount || 0),
      latestAmount: Number(latestAmount || 0),
      transactionType: data.transaction_type,
    });

    result.set(data.token, newAmount);

    return result;
  }

  const newAmount = getNewAmountAccordingToTransactionType({
    amount: Number(data.amount || 0),
    latestAmount: Number(latestAmount || 0),
    transactionType: data.transaction_type,
  });

  result.set(data.token, newAmount);

  return result;
};
