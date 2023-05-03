import Timer from '../Etc/Timer';
import './Verify.css';

function Verify() {
    const verifyCode = (event: React.FormEvent<HTMLFormElement>): void => {
        const target: HTMLButtonElement = event.target as HTMLButtonElement;
        target.setAttribute('disabled', '');
        //api 보내기
    }
    
    return (
        <div id="verify">
            <div id="title">Two Factor<br/>Verification</div>
            <Timer/>
            <form id="verify-form" onSubmit={verifyCode}>
                <input id="verify-input" placeholder="code"></input>
                <button id="verify-button">verify</button>
            </form>
        </div>
    )
}

export default Verify;