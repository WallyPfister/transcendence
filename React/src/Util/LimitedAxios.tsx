import axios from "axios";
import Swal from "sweetalert2";

const LimitedAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

LimitedAxios.interceptors.request.use((config) => {
    if (config.headers['Authorization'] === undefined) {
        if (localStorage.getItem('ltoken'))
            config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('ltoken');
        else if (localStorage.getItem('atoken'))
            config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('atoken');
    }
    return config;
});

LimitedAxios.interceptors.response.use((response) => {
    return (response);
}, (error) => {
    if (error.response?.status === 401) {
        Swal.fire('Your token has been expired\nPlease login again').then(() => {
            window.location.href = process.env.REACT_APP_42_URL || 'intra.42.fr';
        });
    }
    return Promise.reject(error);
});

export default LimitedAxios;