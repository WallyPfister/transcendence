import axios, { AxiosInstance } from "axios";
import errorHandler from "./errorHandler";

const CustomAxios: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {'Content-Type' : 'application/json'}
});

CustomAxios.interceptors.request.use((config) => {
    config.headers["Authorization"] = "Bearer " + localStorage.getItem('token');
    return (config);
}, (error) => {
    console.log(error);
    return (error);
});

CustomAxios.interceptors.response.use((response) => {
    return (response);
}, (error) => {
    errorHandler(error);
    return (error);
});

export default CustomAxios;