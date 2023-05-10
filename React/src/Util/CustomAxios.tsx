import axios, { AxiosInstance } from "axios";
import errorHandler from "./errorHandler";

const CustomAxios: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

CustomAxios.interceptors.request.use((config) => {
    if (config.headers['Authorization'] === undefined)
        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
    return config;
})

CustomAxios.interceptors.response.use((response) => {
    return (response);
}, (error) => {
    errorHandler(error);
    return Promise.reject(error);
});

export default CustomAxios;