import { useRef, useEffect, useState } from "react";
import { useContext } from "react";
import { SocketContext } from "../Socket/SocketContext";
import { useLocation, useNavigate } from "react-router-dom";

interface Ball {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: 5;
  velocityY: 5;
  color: string;
}

function Game() {
  const socket = useContext(SocketContext);
  const location = useLocation();
  const gameData = location.state;

  const navigate = useNavigate();

  useEffect(() => {
    if (gameData == undefined || gameData.roomId == undefined) {
      console.log("Gamedata undifined");
      navigate("/login");
      return;
    }
    socket.emit("register", { roomId: gameData.roomId });
    console.log("send register");
  }, []);

  const canvasRef = useRef(null);
  let canvas;
  let context;

  const [playerA, setPlayerA] = useState({
    x: 0,
    y: 250,
    width: 10,
    height: 100,
    color: "GRAY",
    score: 0,
  });

  const [playerB, setPlayerB] = useState({
    x: 890,
    y: 250,
    width: 10,
    height: 100,
    color: "GRAY",
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
    socket.emit("register", { roomId: gameData.roomId, type: gameData.type, playerA: gameData.playerA, playerB: gameData.playerB });
    console.log("send register");
  }, []);

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
      if (gameData.side == 0) {
        const updateplayerB = {
          x: data.playerB.x,
          y: data.playerB.y,
          width: 10,
          height: 100,
          color: "BLACK",
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
      console.log(gameData.nickname);
      if (gameData.nickname == gameData.playerA) {
        playerA.y = evt.clientY - rect.top - playerA.height / 2;
        socket.emit("paddleA", { roomId: gameData.roomId, y: playerA.y });
      } else {
        playerB.y = evt.clientY - rect.top - playerA.height / 2;
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

  return (
    <div id="main">
      <button
        id="casual-button"
        onClick={() => socket.emit("register", { roomId: "1" })}
      >
        1 vs 1
      </button>
      <canvas ref={canvasRef} width="900" height="600">
        {" "}
      </canvas>
    </div>
  );
}

export default Game;
