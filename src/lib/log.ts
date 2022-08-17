import Table from "cli-table3";
import chalk from "chalk";

const log = console.log;

const error = (error: string) => console.error(chalk.red(error));

const table = (
  options?: Table.TableConstructorOptions & {
    body: Array<Array<string | number | null | undefined>>;
  }
) => {
  const table = new Table(options);

  options?.body.forEach((row) => table.push(row));

  log(table.toString());
};

export { log, error, table };
