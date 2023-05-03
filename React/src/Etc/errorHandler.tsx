import { AxiosError, InternalAxiosRequestConfig } from "axios";
import CustomAxios from "./CustomAxios";

async function errorHandler(error: AxiosError) {
    if (error.response?.status === 401) {
        if (error.response.data === "Invalid access token" || error.response.data === "Unauthorized") {
            //invalid, refresh fail -> token delete 후 42로그인으로
            localStorage.removeItem('token');
            localStorage.removeItem('rtoken');
            window.location.href = process.env.REACT_APP_42_URL || ''; //여기 뭐해야하지
        } else if (error.response.data === "Expired access token") {
            //token 만료 -> refresh 후 재요청
            const originalRequest: InternalAxiosRequestConfig | undefined = error.config;
            const refreshToken: string | null = localStorage.getItem('rtoken');

            if (originalRequest && refreshToken) {
                await CustomAxios.get('/auth/jwt-refresh', {headers: {'Authorization': 'Bearer ' + refreshToken}}).then((res) => {
                    const { access, refresh } = res.data;
                    localStorage.setItem('token', access);
                    localStorage.setItem('rtoken', refresh);
                    originalRequest.headers['Authorization'] = 'Bearer' + access;
                });
                return CustomAxios(originalRequest);
            }
        }
    }
}

export default errorHandler;