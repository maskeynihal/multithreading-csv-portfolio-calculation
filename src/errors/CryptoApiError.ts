class CryptoApiError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "CryptoApiError";

    //@ts-ignore
    this.stack = message?.stack;
  }
}

export default CryptoApiError;
