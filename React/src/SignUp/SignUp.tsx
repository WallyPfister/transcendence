import { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Timer from '../Etc/Timer';
import { SignUpHandlers as handler } from './SignUpHandlers';
import './SignUp.css';

function SignUp() {
    const nav: NavigateFunction = useNavigate();
    const [nickPass, setNickPass] = useState(false);
    const [codePass, setCodePass] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    return (
        <div id="sign-up">
            <div id="title">Create Profile</div>
            <div id="profile-form">
                <div id="nick-form" className="info-form">
                    <input id="nick-input" placeholder="nickname" autoComplete="off"></input>
                    <button id="nick-button" onClick={(e) => handler.nickCheck(e, setNickPass)}>check</button>
                </div>
                <div id="email-form" className="info-form">
                    <input id="email-input" placeholder="email" autoComplete="off"></input>
                    <Timer isRunning={isRunning} setIsRunning={setIsRunning} />
                </div>
                <div id="code-form" className="info-form">
                    <input id="code-input" placeholder="code" autoComplete="off"></input>
                    <button id="verify-button" onClick={(e) => handler.codeCheck(e, setCodePass, setIsRunning)} disabled={!isRunning}>confirm</button>
                </div>
                <div id="file-wrapper">
                    <label htmlFor="avatar">
                        <div id="upload-button"></div>
                        <div id="file-name">upload image</div>
                    </label>
                    <input id="avatar" type="file" accept="image/*" onChange={handler.fileInput} />
                </div>
                <label><input id="auth-check" type="checkbox" value="true" />use email auth in login</label>
                <div id="buttons">
                    <button id="profile-submit" onClick={(e) => handler.register(e, nickPass, codePass, nav)}>OK</button>
                    <button id="profile-cancle" onClick={() => nav('/')}>CANCLE</button>
                </div>
            </div>
        </div>
    )
}

export default SignUp;
