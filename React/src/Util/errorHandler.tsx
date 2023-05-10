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
            //invalid, refresh fail -> token delete 후 42로그인으로
            removeToken();
            window.location.href = process.env.REACT_APP_42_URL || 'intra.42.fr'; //42로그인으로? 로그인 버튼 있는 페이지로?
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
        //DB (서버) 오류 시 토큰 삭제 후 로그인 화면으로 이동
        Swal.fire('관리자에게 문의해주세요.').then((res) => {
            if (res.isConfirmed) {
                removeToken();
                window.location.href = process.env.REACT_APP_CLIENT_URL || 'intra.42.fr';
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