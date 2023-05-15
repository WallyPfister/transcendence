import { AxiosError, InternalAxiosRequestConfig } from "axios";
import Swal from "sweetalert2";
import CustomAxios from "./CustomAxios";

interface ErrorResponse {
    error?: string;
    message?: string;
    statusCode?: number;
  }

async function errorHandler(error: AxiosError) {
    if (error.response && error.response.status === 401) {
        const msg = (error.response.data as ErrorResponse).message;
        if (msg === "Invalid access token." || msg === "Unauthorized") {
            removeToken();
            window.location.href = process.env.REACT_APP_CLIENT_URL || 'intra.42.fr';
        } else if (msg === "Expired access token.") {
            const originalRequest: InternalAxiosRequestConfig | undefined = error.config;
            const refreshToken: string | null = localStorage.getItem('rtoken');

            if (originalRequest && refreshToken) {
                await CustomAxios.get('/auth/jwt-refresh', {headers: {'Authorization': 'Bearer ' + refreshToken}}).then((res) => {
                    const { accessToken, refreshToken } = res.data;
                    localStorage.setItem('token', accessToken);
                    localStorage.setItem('rtoken', refreshToken);
                    originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
                });
                return CustomAxios(originalRequest);
            }
        }
    } else if (error.response && error.response.status === 500) {
        removeToken();
        Swal.fire('관리자에게 문의해주세요.').then((res) => {
            if (res.isConfirmed) {
                window.location.href = process.env.REACT_APP_CLIENT_URL || 'intra.42.fr';
            }
        });
    }
}

export const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rtoken');
    localStorage.removeItem('ltoken');
    localStorage.removeItem('ctoken');
    localStorage.removeItem('atoken');
}

export default errorHandler;