import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../Util/Timer';
import verifyCode from './VerifyCode';
import './Verify.css';

function Verify() {
    const [isRunning, setIsRunning] = useState(false);
    const nav = useNavigate();
    
    return (
        <div id="verify">
            <div id="title">Two Factor<br/>Authentication</div>
            <Timer isRunning={isRunning} setIsRunning={setIsRunning}/>
            <div id="verify-form">
                <input id="verify-input" placeholder="code"></input>
                <button id="verify-button" onClick={(e)=>verifyCode(e, nav)}>verify</button>
            </div>
        </div>
    )
}

export default Verify;