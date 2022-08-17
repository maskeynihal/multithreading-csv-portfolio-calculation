import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname + "/../.env") });

import cli from "./lib/cli";
import {
  calculate,
  calculateWithMultiThread,
} from "./controllers/portfolio.controller";

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
