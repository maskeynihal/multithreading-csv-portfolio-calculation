import knex from "knex";
import toSnakeCase from "to-snake-case";
import toCamelCaseKey from "camelcase-keys";

import config from "../../knexfile";

const knexConfig = {
  ...config.development,
};

export default knex(knexConfig);
