import { useRef, useEffect, useState } from "react";
import { useContext } from "react";
import { SocketContext } from "../Socket/SocketContext";
import { useLocation, useNavigate } from "react-router-dom";
import CustomAxios from "../Util/CustomAxios";
import "./Game.css";
import ResultModal from "./ResultModal";

interface Ball {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: 5;
  velocityY: 5;
  color: string;
}

interface PlayerData {
  name: string;
  avatar: string;
  level: number;
}

function Game() {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const location = useLocation();
  const gameData = location.state;

  const [aInfo, setAInfo] = useState<PlayerData>();
  const [bInfo, setBInfo] = useState<PlayerData>();
  const [showResult, setShowResult] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerData>(null);

  useEffect(() => {

    if (gameData === null) {
      navigate("/");
      return;
    }

	socket.emit("gameIn", gameData.roomId);

    CustomAxios.get("/member/profile", {
      params: { userName: gameData.playerA },
    }).then((res) => {
      setAInfo({
        name: res.data.name,
        avatar: res.data.avatar,
        level: res.data.level,
      });
    });

    CustomAxios.get("/member/profile", {
      params: { userName: gameData.playerB },
    }).then((res) => {
      setBInfo({
        name: res.data.name,
        avatar: res.data.avatar,
        level: res.data.level,
      });
    });

    socket.emit("register", {
      roomId: gameData.roomId,
      type: gameData.type,
      playerA: gameData.playerA,
      playerB: gameData.playerB,
    });
  }, []);

  useEffect(() => {
    socket.on("endGame", (data) => {
		setWinner(data.playerA.score > data.playerB.score ? aInfo : bInfo);
		if (gameData.side === 0) {
			CustomAxios.post("/game", {
				winner:
				data.playerA.score > data.playerB.score ? gameData.playerA : gameData.playerB,
				loser:
				data.playerA.score < data.playerB.score ? gameData.playerA : gameData.playerB,
				winScore:
				data.playerA.score > data.playerB.score ? data.playerA.score : data.playerB.score,
				loseScore:
				data.playerA.score < data.playerB.score ? data.playerA.score : data.playerB.score,
				type: gameData.type,
			  });
		  }
		setShowResult(true);
    });
    return () => {
      socket.off("endGame");
    }
  }, [aInfo, bInfo]);

  socket.on("gameOut", () => {
	navigate('/');
	return () => {
		socket.off("gameOut");
	  }
  })

  const canvasRef = useRef(null);
  let canvas;
  let context;

  const [playerA, setPlayerA] = useState({
    x: 0,
    y: 250,
    width: 10,
    height: 100,
    color: "GRAY",
	nickname: "default",
    score: 0,
  });

  const [playerB, setPlayerB] = useState({
    x: 890,
    y: 250,
    width: 10,
    height: 100,
    color: "GRAY",
	nickname: "default",
    score: 0,
  });

  const [ball, setBall] = useState({
    x: 450,
    y: 300,
    radius: 10,
    speed: 10,
    velocityX: 5,
    velocityY: 5,
    color: "BLACK",
  });

  useEffect(() => {
    canvas = canvasRef.current;
    context = canvas.getContext("2d");

    socket.on("update", (data) => {
      const updateBall: Ball = {
        x: data.ball.x,
        y: data.ball.y,
        radius: data.ball.radius,
        speed: data.ball.speed,
        velocityX: data.ball.velocityX,
        velocityY: data.ball.velocityY,
        color: data.ball.color,
      };
      if (gameData.side === 0) {
        const updateplayerB = {
          x: data.playerB.x,
          y: data.playerB.y,
          width: 10,
          height: 100,
          color: "BLACK",
		  nickname: data.playerB.nickname,
          score: data.playerB.score,
        };
        setPlayerB(updateplayerB);
      } else {
        const updateplayerA = {
          x: data.playerA.x,
          y: data.playerA.y,
          width: 10,
          height: 100,
          color: "BLACK",
		  nickname: data.playerA.nickname,
          score: data.playerA.score,
        };
        setPlayerA(updateplayerA);
      }
      playerA.score = data.playerA.score;
      playerB.score = data.playerB.score;
      setBall(updateBall);
    });

    function movePaddle(evt) {
      let rect = canvas.getBoundingClientRect();
      if (gameData.side === 0) {
        playerA.y = evt.clientY - rect.top - playerA.height / 2;
        socket.emit("paddleA", { roomId: gameData.roomId, y: playerA.y });
      } else {
        playerB.y = evt.clientY - rect.top - playerB.height / 2;
        socket.emit("paddleB", { roomId: gameData.roomId, y: playerB.y });
      }
    }
    canvas.addEventListener("mousemove", movePaddle);
  }, []);

  useEffect(() => {
    canvas = canvasRef.current;
    context = canvas.getContext("2d");
    render();
  }, [ball]);

  function drawRect(x, y, w, h, c) {
    context.fillStyle = c;
    context.fillRect(x, y, w, h);
  }

  function drawNet() {
    const net = {
      x: canvas.width / 2 - 1,
      y: 0,
      width: 2,
      height: 10,
      color: "BLACK",
    };

    for (let i = 0; i <= canvas.height; i += 15) {
      drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
  }

  function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = "45px Arial";
    context.fillText(text, x, y);
  }

  function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
  }

  function render() {
    drawRect(0, 0, 900, 600, "WHITE");
    drawNet();

    drawText(playerA.score, canvas.width / 4, canvas.height / 5, "BLACK");
    drawText(playerB.score, (3 * canvas.width) / 4, canvas.height / 5, "BLACK");

    drawRect(
      playerA.x,
      playerA.y,
      playerA.width,
      playerA.height,
      playerA.color
    );
    drawRect(
      playerB.x,
      playerB.y,
      playerB.width,
      playerB.height,
      playerB.color
    );

    drawCircle(ball.x, ball.y, ball.radius, ball.color);
  }

  return (
    <div id="game">
      {aInfo && bInfo ? (
        <div id="info">
          <div id="playerA" className="player-box">
            <img className="avatar" src={aInfo.avatar} alt="img" />
            <div className="name-level">
              <p className="nickname">{aInfo.name}</p>
              <p className="level">
                <img
                  className="tier-img"
                  src={
                    "../img/tier" + (aInfo.level > 5 ? 5 : aInfo.level) + ".png"
                  }
                  alt="tier"
                />
                Lv. {aInfo.level}
              </p>
            </div>
          </div>
          <div id="game-type">{gameData.type === 2 ? "Rank" : "1 VS 1"}</div>
          <div id="playerB" className="player-box">
            <div className="name-level">
              <p className="nickname">{bInfo.name}</p>
              <p className="level">
                <img
                  className="tier-img"
                  src={
                    "../img/tier" + (bInfo.level > 5 ? 5 : bInfo.level) + ".png"
                  }
                  alt="tier"
                />
                LV. {bInfo.level}
              </p>
            </div>
            <img className="avatar" src={bInfo.avatar} alt="img" />
          </div>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        width="900"
        height="600"
        className={aInfo && bInfo ? "" : "wait"}
      >
        {" "}
      </canvas>
      {showResult && winner && (
        <div className="result-modal-overlay">
          <ResultModal playerData={winner} />
        </div>
      )}
    </div>
  );
}

export default Game;
