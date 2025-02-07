import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://xqyndr-3000.csb.app",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
