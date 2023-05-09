import LimitedAxios from "./LimitedAxios";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

interface TimerProps {
    isRunning: boolean,
    setIsRunning: React.Dispatch<React.SetStateAction<boolean>>
}

function Timer({ isRunning, setIsRunning }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(0);

    const minutes = String(Math.floor((timeLeft / (1000 * 60)) % 60)).padStart(2, '0');
    const second = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, '0');

    useEffect(() => {
        if (isRunning) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1000);
            }, 1000);
    
            if (timeLeft < 0) {
                document.getElementById('send-button')?.removeAttribute('disabled');
                clearInterval(timer);
                setIsRunning(false);
            }

            return () => {
                clearInterval(timer);
            }
        }
    }, [timeLeft, isRunning, setIsRunning]);

    const sendCode = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const target: HTMLButtonElement = event.target as HTMLButtonElement;
        const email: HTMLInputElement = document.getElementById('email-input') as HTMLInputElement;

        target.setAttribute('disabled', '');
        LimitedAxios.post(email ? '/auth/signup/tfa-send' : '/auth/signin/tfa-send', email ? {"email": email.value} : null)
            .then(() => {
                setTimeLeft(180 * 1000);
                setIsRunning(true);
            }).catch((err) => {
                if (err.response.status === 500)
                    Swal.fire('Authentication code has failed to be sent');
                target.removeAttribute('disabled');
            });
    }

    return (
        <button id="send-button" onClick={sendCode}>
            {
                isRunning ? `${minutes} : ${second}` : 'send'
            }
        </button>
    )
}

export default Timer;