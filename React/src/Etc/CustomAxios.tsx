import axios, { AxiosInstance } from "axios";

const CAxios: AxiosInstance = axios.create({
    baseURL : process.env.REACT_APP_API_URL
});

CAxios.interceptors.request.use((config) => {
    return (config);
});