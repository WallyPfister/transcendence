import "./StartGameModal.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

export function useStartGame(socket: Socket) {
  const [showStart, setShowStart] = useState(false);
  const [startData, setStartData] = useState(null);

  useEffect(() => {
    socket.on(
      "startGame",
      (data: {
        type: number;
        roomId: string;
        playerA: string;
        playerB: string;
        side: number;
      }) => {
        setStartData(data);
        setShowStart(true);
      }
    );
  }, []);

  return { showStart, closeStart: () => setShowStart(false), startData };
}

type Props = {
  onClose: () => void;
  data: any;
};

export function StartGameModal(props: Props) {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(10);

  const opponent =
    props.data.side === 1 ? props.data.playerA : props.data.playerB;

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(countdown);
      props.onClose();
      navigate("/game", { state: props.data });
    }, 10000); // 10 seconds

    return () => {
      clearTimeout(timeout);
      clearInterval(countdown);

    };
  }, []);

  return (
    <div className={"startgame-modal"}>
      <div>Here Comes A New Challenger</div>
      <div>${opponent}</div>
      <div>{timer} seconds</div>
    </div>
  );
}
