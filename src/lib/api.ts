import axios from "axios";
import app from "../config/app";

const api = axios.create({
  baseURL: app.crypto.base,
  headers: {
    Authorization: `Apikey ${app.crypto.apiKey}`,
  },
});

export default api;
