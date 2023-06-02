import { useNavigate } from 'react-router-dom';
import loginClick from './loginClick';
import './Login.css';

function Login() {
    const nav = useNavigate();

    return (
        <div id="login">
            <div id="title">Wally Pfister's<br/>PING 🏓 PONG</div>
            <button id="login-button" onClick={()=>loginClick(nav)}>Login</button>
        </div>
    )
}

export default Login;