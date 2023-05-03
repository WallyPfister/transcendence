import CustomAxios from '../Etc/CustomAxios';
import Timer from '../Etc/Timer';
import './SignUp.css';

function SignUp() {
    const nickCheck = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        CustomAxios.get('/member/checkName', {params: {name: 'sojoo'}}).then((res) => {
            if (res.data === true)
                console.log('true');
        });
    }

    const emailCheck = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();

    }

    return (
        <div id="sign-up">
            <div id="title">Create Profile</div>
            <form id="profile-form">
                <div id="nick-form" className="info-form">
                    <input id="nick-input" placeholder="nickname" autoComplete="off"></input>
                    <button id="nick-button" onClick={nickCheck}>check</button>
                </div>
                <div id="email-form" className="info-form">
                    <input id="email-input" placeholder="email" autoComplete="off"></input>
                    <Timer/>
                </div>
                <div id="code-form" className="info-form">
                    <input id="code-input" placeholder="code" autoComplete="off"></input>
                    <button id="code-button">confirm</button>
                </div>
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