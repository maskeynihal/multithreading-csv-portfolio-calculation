export default {
  crypto: {
    base: process.env.CRYPTO_COMPARE_BASE_URL || "",
    apiKey: process.env.CRYPTO_COMPARE_API_KEY,
  },
  portfolio: {
    filePath:
      process.cwd() + ["", "data", "transaction_2022_07_13.csv"].join("/"),
    tmpFolder: process.cwd() + ["", "data", "tmp"].join("/"),
  },
};
