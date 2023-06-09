import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Gamebuttons.css";
import { SocketContext } from "../../../Socket/SocketContext";

function GameButtons({ nickname }) {
  const socket = useContext(SocketContext);

  const [casualClicked, setCasualClicked] = useState(false);
  const [ladderClicked, setLadderClicked] = useState(false);
  const [casualTime, setCasualTime] = useState(0);
  const [ladderTime, setLadderTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("addQueue", (type: number) => {
      if (type === 0) startTimer(setCasualTime);
      else if (type === 2) startTimer(setLadderTime);
    });

    socket.on("failQueue", () => {
      setCasualClicked(false);
      setLadderClicked(false);
    });

    return () => {
      socket.off("addQueue");
      socket.off("failQueue");
    };
  });

  const handleCasualGame = () => {
    if (!casualClicked) {
      setCasualClicked(true);
      socket.emit("enterGame", 0);
    }
  };

  const handleLadderGame = () => {
    if (!ladderClicked) {
      setLadderClicked(true);
      socket.emit("enterGame", 2);
    }
  };

  const goToRanking = (user) => {
    navigate("/rank", { state: { user } });
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const startTimer = (setTime) => {
    clearInterval(timerInterval);

    const startTime = Date.now();
    setTime(0);

    const interval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setTime(elapsedTime);
    }, 1000);

    setTimerInterval(interval);
  };

  return (
    <div id="game-buttons">
      <button
        id="casual-button"
        onClick={handleCasualGame}
        disabled={ladderClicked || casualClicked}
      >
        {casualClicked ? formatTime(casualTime) : "1 vs 1"}
      </button>
      <button
        id="ladder-button"
        onClick={handleLadderGame}
        disabled={ladderClicked || casualClicked}
      >
        {ladderClicked ? formatTime(ladderTime) : "Rank"}
      </button>
      <button id="ranking-button" onClick={() => goToRanking(nickname)}>
        Ranking
      </button>
    </div>
  );
}

export default GameButtons;
