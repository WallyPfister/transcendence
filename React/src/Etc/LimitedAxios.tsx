import axios, { AxiosInstance } from "axios";
import Swal from "sweetalert2";

const LimitedAxios: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

LimitedAxios.interceptors.request.use((config) => {
    if (config.headers['Authorization'] === undefined)
        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('ltoken');
    return config;
});

LimitedAxios.interceptors.response.use((response) => {
    return (response);
}, (error) => {
    if (error.response?.status === 401) {
        Swal.fire('Your token has been expired\nPlease login again').then(() => {
            window.location.href = process.env.REACT_APP_42_URL || 'where42.kr';
        });
    } else
        console.log(error);
    return Promise.reject(error);
});

export default LimitedAxios;