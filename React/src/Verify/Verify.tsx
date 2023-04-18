import React from "react";
import './Verify.css';

function Verify() {
    return (
        <div id="verify">
            <div id="title">Two Factor<br/>Verification</div>
            <button id="send-button">send</button>
            <form id="verify-form">
                <input id="verify-input" placeholder="code"></input>
                <button id="verify-button">verify</button>
            </form>
        </div>
    )
}

export default Verify;