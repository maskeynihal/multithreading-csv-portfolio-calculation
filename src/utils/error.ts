import { ZodError } from "zod";
import { error as logError } from "../lib/log";
import CryptoApiError from "../errors/CryptoApiError";

export const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    JSON.parse(error.message).forEach(({ message }: ZodError) =>
      logError(message)
    );
  }

  if (error instanceof CryptoApiError) {
    logError(`Error in currency conversion (${error.message})`);
  }
};
