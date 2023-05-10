import axios from "axios";
import { useEffect } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function OAuth() {
    const nav: NavigateFunction = useNavigate();
    const url: URL = new URL(window.location.href);
    const code: string | null = url.searchParams.get("code");

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_URL + '/auth/callback', {params: {code: code}}).then((res) => {
            if (res.data.limitedToken) {
                localStorage.setItem('ltoken', res.data.limitedToken);
                nav('/verify');
            }
            else {
                localStorage.setItem('token', res.data.accessToken);
                localStorage.setItem('rtoken', res.data.refreshToken);
                nav('/main');
            }
        }).catch((err) => {
            if (err.response.status === 401) {
                localStorage.setItem('ltoken', err.response.data.message);
                nav('/signup');
            }
            else if (err.response.status === 429)
                Swal.fire('잠시 후 다시 시도해주세요.').then(() => nav('/'));
            else if (err.response.status === 500)
                Swal.fire('관리자에게 문의해주세요.').then(() => nav('/'));
        });
    }, [code, nav]);

    return (
        <img src="../spinner.gif" alt="img"></img>
    )
}

export default OAuth;