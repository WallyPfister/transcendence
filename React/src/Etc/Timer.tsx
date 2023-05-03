import { useState, useEffect } from "react";

function Timer() {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

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
    }, [timeLeft, isRunning]);

    const sendCode = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const target: HTMLButtonElement = event.target as HTMLButtonElement;
        target.setAttribute('disabled', '');
        // api 보내고 then에서 타이머 시작
        setTimeLeft(5 * 1000);
        setIsRunning(true);
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