import './Login.css';

function Login() {
    const loginClick = (): void => {
        const token: string | null = localStorage.getItem('token');
        if (token) {
            
        }
    }

    return (
        <div id="login">
            <div id="title">Wally Pfister's<br/>PING 🏓 PONG</div>
            <button id="login-button" onClick={loginClick}>Login</button>
        </div>
    )
}

export default Login;