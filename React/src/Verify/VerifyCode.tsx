import { NavigateFunction } from "react-router-dom";
import LimitedAxios from "../Util/LimitedAxios";
import Swal from "sweetalert2";

const verifyCode = (event: React.MouseEvent<HTMLButtonElement>, nav: NavigateFunction): void => {
    event.preventDefault();

    const target = event.target as HTMLButtonElement;
    const input = document.getElementById('verify-input') as HTMLInputElement;

    target.setAttribute('disabled', '');
    LimitedAxios.get('/auth/signin/tfa-verify', {params: {code: input.value}}).then((res) => {
        const { accessToken, refreshToken } = res.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('rtoken', refreshToken);
        localStorage.removeItem('atoken');
        nav('/main');
    }).catch((err) => {
        if (err.response.status === 409)
            Swal.fire('Code is incorrect');
        target.removeAttribute('disabled');
    });
}

export default verifyCode;