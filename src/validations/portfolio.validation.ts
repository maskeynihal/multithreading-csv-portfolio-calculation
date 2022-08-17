import { isValidDate } from "../lib/date";
import validator from "../lib/validator";

export const PortfolioOptions = validator.object({
  token: validator.string().optional(),
  date: validator
    .string()
    .refine((date) => isValidDate(date), {
      message: "Date is not valid",
    })
    .optional(),
});

export type IPortfolioOptions = validator.infer<typeof PortfolioOptions>;

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
}

export const TransactionTypes = validator.nativeEnum(TransactionType);
