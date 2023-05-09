import LimitedAxios from '../Etc/LimitedAxios';
import Timer from '../Etc/Timer';
import Swal from 'sweetalert2';
import './Verify.css';
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { useState } from 'react';

function Verify() {
    const nav: NavigateFunction = useNavigate();
    const [isRunning, setIsRunning] = useState(false);

    const verifyCode = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();

        const target: HTMLButtonElement = event.target as HTMLButtonElement;
        const input: HTMLInputElement = document.getElementById('verify-input') as HTMLInputElement;

        target.setAttribute('disabled', '');
        LimitedAxios.get('/auth/signin/tfa-verify', {params: {code: input.value}}).then((res) => {
            const { access, refresh } = res.data;
            localStorage.setItem('token', access);
            localStorage.setItem('rtoken', refresh);
            localStorage.removeItem('ltoken');
            nav('/main');
        }).catch((err) => {
            if (err.response.status === 409)
                Swal.fire('Code is incorrect');
        });
    }
    
    return (
        <div id="verify">
            <div id="title">Two Factor<br/>Authentication</div>
            <Timer isRunning={isRunning} setIsRunning={setIsRunning}/>
            <div id="verify-form">
                <input id="verify-input" placeholder="code"></input>
                <button id="verify-button" onClick={verifyCode} disabled>verify</button>
            </div>
        </div>
    )
}

export default Verify;