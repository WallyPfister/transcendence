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
        if (msg === "Invalid access token." || msg === "Unauthorized") { //refresh fail msg 바꾸고 tfa 안한 사람은 unauthorized로 가자
            //invalid, refresh fail -> token delete 후 42로그인으로
            removeToken();
            window.location.href = process.env.REACT_APP_42_URL || 'where42.kr'; //여기 뭐해야하지
        } else if (msg === "Expired access token.") {
            //token 만료 -> refresh 후 재요청
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
        } else
            console.log(error);
    } else if (error.response && error.response.status === 500) {
        Swal.fire('관리자에게 문의해주세요.').then((res) => {
            if (res.isConfirmed) {
                removeToken();
                window.location.href = process.env.REACT_APP_CLIENT_URL || 'where42.kr';
            }
        });
    } else
        console.log(error);
}

const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rtoken');
    localStorage.removeItem('ltoken');
    localStorage.removeItem('ctoken');
    localStorage.removeItem('atoken');
}

export default errorHandler;