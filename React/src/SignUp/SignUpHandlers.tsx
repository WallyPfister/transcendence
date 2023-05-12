import { NavigateFunction } from 'react-router-dom';
import LimitedAxios from '../Util/LimitedAxios';
import Swal from 'sweetalert2';

const nickCheck = (event: React.MouseEvent<HTMLButtonElement>, setNickPass: React.Dispatch<React.SetStateAction<boolean>>): void => {
    event.preventDefault();
    const input: HTMLInputElement = document.getElementById("nick-input") as HTMLInputElement;
    LimitedAxios.get('/member/checkName', {params: {name: input.value}})
        .then((res) => {
            if (res.data === true) {
                Swal.fire({
                    text: 'The nickname is available\nDo you want to use it?',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                }).then((res) => {
                    if (res.isConfirmed) {
                        input.setAttribute('disabled', '');
                        setNickPass(true);
                    }
                });
            } else
                Swal.fire('The nickname already exists');
        }).catch((err) => {
            if (err.response.status === 400)
                Swal.fire('Format of nickname is incorrect');
        });
}

const codeCheck = (event: React.MouseEvent<HTMLButtonElement>, setCodePass: React.Dispatch<React.SetStateAction<boolean>>, setIsRunning: React.Dispatch<React.SetStateAction<boolean>>): void => {
    event.preventDefault();
    const confirmButton: HTMLButtonElement = event.target as HTMLButtonElement;
    const codeInput: HTMLInputElement = document.getElementById("code-input") as HTMLInputElement;
    LimitedAxios.get('/auth/signup/tfa-verify', {params: {code: codeInput.value}})
        .then((res) => {
            const emailInput: HTMLInputElement = document.getElementById("email-input") as HTMLInputElement;
            const sendButton: HTMLButtonElement = document.getElementById("send-button") as HTMLButtonElement;
            Swal.fire('Your e-mail address has been confirmed');
            codeInput.setAttribute('disabled', '');
            confirmButton.setAttribute('disabled', '');
            emailInput.setAttribute('disabled', '');
            sendButton.setAttribute('disabled', '');
            localStorage.setItem('ctoken', res.data.limitedToken);
            setCodePass(true);
            setIsRunning(false);
        }).catch((err) => {
            if (err.response.status === 409)
                Swal.fire('Code is incorrect');
        });
}

const fileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const file: File | null = target.files && target.files[0];
    const nameDiv: HTMLDivElement = document.getElementById('file-name') as HTMLDivElement;

    if (file)
        nameDiv.innerText = file.name;
}

const register = (event: React.MouseEvent<HTMLButtonElement>, nickPass: boolean, codePass: boolean, nav: NavigateFunction): void => {
    event.preventDefault();
    const name: string = (document.getElementById('nick-input') as HTMLInputElement).value;
    const mail: string = (document.getElementById('email-input') as HTMLInputElement).value;
    const tfa: boolean = (document.getElementById('auth-check') as HTMLInputElement).checked;
    const files: FileList | null = (document.getElementById('avatar') as HTMLInputElement).files;

    if (nickPass === false)
        Swal.fire('Please check nickname');
    else if (codePass === false)
        Swal.fire('Please confirm email code');
    else if (files && files.length === 0) {
        registerApiRequest(name, "../img/default-avatar.jpeg", mail, tfa, nav);
    } else if (files) {
        const fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(files[0]);
        fileReader.onloadend = () => {
            const base64: string = fileReader.result as string;
            registerApiRequest(name, base64, mail, tfa, nav);
        }
    }
}

const registerApiRequest = (name: string, base64: string, mail: string, tfa: boolean, nav: NavigateFunction) => {
    LimitedAxios.post('/member', {
        "name": name,
        "intraId": "sojoo is the best",
        "avatar": base64,
        "email": mail,
        "twoFactor": tfa
    }, {headers: {'Authorization': 'Bearer ' + localStorage.getItem('ctoken')}}).then((res) => {
        const { accessToken, refreshToken } = res.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('rtoken', refreshToken);
        localStorage.removeItem('ltoken');
        localStorage.removeItem('ctoken');
        nav('/main');
    }).catch((err) => {
        if (err.response.status === 409)
            Swal.fire('You have already signed up');
    });
}

export const SignUpHandlers = {
    nickCheck,
    codeCheck,
    fileInput,
    register
}