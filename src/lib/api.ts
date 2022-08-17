import process from "process";
import app from "../config/app";
import Cache from "../utils/cache";
import axios, { AxiosRequestConfig } from "axios";
import CryptoApiError from "../errors/CryptoApiError";

const cache = new Cache({ filePath: process.cwd() + "/.cache" });

const api = axios.create({
  baseURL: app.crypto.base,
  headers: {
    Authorization: `Apikey ${app.crypto.apiKey}`,
  },
});

export const get = async (url: string, params: AxiosRequestConfig) => {
  const uniqueKey = `${url}${JSON.stringify(params)}`;
  const cached = cache.get(uniqueKey);

  if (cached) {
    return Promise.resolve(cached);
  }

  const { data } = await api.get(url, params);

  if (data?.Response === "Error") {
    throw new CryptoApiError(data?.Message);
  }

  cache.set(uniqueKey, data);

  return data;
};

export default api;
