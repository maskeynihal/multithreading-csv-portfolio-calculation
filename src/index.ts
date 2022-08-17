import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname + "/../../.env") });

import { importCsv } from "./controllers/import.controllers";
import {
  calculate,
  calculateWithMultiThread,
} from "./controllers/portfolio.controller";
import cli from "./lib/cli";

cli.command("setup").description("Setup the portfolio.").action(importCsv);

cli
  .command("pf")
  .description("Generate a portfolio (slow)")
  .option("-t, --token <token>", "Token for the portfolio")
  .option("-d, --date <date>", "Date for the portfolio")
  .action(calculate);

cli
  .command("pft")
  .description("Generate a portfolio (fast)")
  .option("-t, --token <token>", "Token for the portfolio")
  .option("-d, --date <date>", "Date for the portfolio")
  .action(calculateWithMultiThread);

cli.parse(process.argv);
