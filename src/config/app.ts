export default {
  crypto: {
    base: process.env.CRYPTO_COMPARE_BASE_URL || "",
    apiKey: process.env.CRYPTO_COMPARE_API_KEY,
  },
  portfolio: {
    filePath: process.cwd() + ["", "data", "transactions.csv"].join("/"),
    tmpFolder: process.cwd() + ["", "data", "tmp"].join("/"),
  },
  outDir: "dist",
};
