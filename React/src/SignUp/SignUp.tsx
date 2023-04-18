import './SignUp.css';

function SignUp() {
    return (
        <div id="sign-up">
            <div id="title">Create Profile</div>
            <form id="profile-form">
                <input id="nickname" placeholder="nickname"></input>
                <form id="email-form" className="info-form">
                    <input id="email-input" placeholder="email"></input>
                    <button id="email-button">send</button>
                </form>
                <form id="code-form" className="info-form">
                    <input id="code-input" placeholder="code"></input>
                    <button id="code-button">confirm</button>
                </form>
                <div id="file-wrapper">
                    <label htmlFor="avatar">
                        <div id="upload-button"></div>
                        <div id="file-name">upload image</div>
                    </label>
                    <input id="avatar" type="file"/>
                </div>
                <label><input id="auth-check" type="checkbox" value="true"/>use email auth in login</label>
                <div id="buttons">
                    <button id="profile-submit">OK</button>
                    <button id="profile-cancle">CANCLE</button>
                </div>
            </form>
        </div>
    )
}

export default SignUp;