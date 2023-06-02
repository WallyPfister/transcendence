import "./ResultModal.css";
import { useNavigate } from "react-router-dom";

interface PlayerData {
  name: string;
  avatar: string;
  level: number;
}

type Props = {
  playerData: PlayerData;
};

const ResultModal = (props: Props) => {
  const navigate = useNavigate();

  const handleExitGame = () => {
    navigate("/main");
  };

  return (
    <div id="result-modal">
      <div id="winner">WINNER</div>
      <img className="avatar" src={props.playerData.avatar} alt="img" />
      <div id="info">
        <div id="name">{props.playerData.name}</div>
        <div id="level">LV {props.playerData.level}</div>
      </div>
      <button id="Exit-Game" onClick={() => handleExitGame()}>
        Exit Game
      </button>
    </div>
  );
};

export default ResultModal;
