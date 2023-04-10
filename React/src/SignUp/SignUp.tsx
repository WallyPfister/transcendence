import React from "react";
import './SignUp.css';

function SignUp() {
    return (
        <div id="sign-up">
            <div id="title">Create Profile</div>
            <form id="profile-form">
                <input id="nickname"></input>
                <form id="email-form" className="info-form">
                    <input id="email-input"></input>
                    <button id="email-button"></button>
                </form>
                <form id="code-form" className="info-form">
                    <input id="code-input"></input>
                    <button id="code-button"></button>
                </form>
                <input id="avatar" type="file"></input>
                <input id="auth-check" type="checkbox"></input>
                <div id="buttons">
                    <button id="profile-submit"></button>
                    <button id="profile-cancle"></button>
                </div>
            </form>
        </div>
    )
}

export default SignUp;