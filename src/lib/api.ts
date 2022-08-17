import axios, { AxiosRequestConfig } from "axios";
import process from "process";
import app from "../config/app";

import Cache from "../utils/cache";

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

  return api
    .get(url, params)
    .then((res) => {
      cache.set(uniqueKey, res.data);

      return res.data;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

export default api;
