import { ZodError } from "zod";
import { error as logError } from "../lib/log";

export const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    JSON.parse(error.message).forEach(({ message }: ZodError) =>
      logError(message)
    );
  }
};
