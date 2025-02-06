import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://k3z9zp-3000.csb.app",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
