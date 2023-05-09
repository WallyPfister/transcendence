import { useRef, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useContext } from "react";
import { SocketContext } from "../Socket/SocketContext";
import { useLocation } from "react-router-dom";

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
  const gameData = location.state.data;
  console.log(gameData);

  useEffect(() => {
	console.log(socket.id);
    socket.emit("register", { roomId: '1234' });
	console.log("send register")
  }, []);

  const canvasRef = useRef(null);
  let canvas;
  let context;

  const [user, setUser] = useState({
    x: 0,
    y: 250,
    width: 10,
    height: 100,
    color: "BLACK",
    score: 0,
  });

  const [com, setCom] = useState({
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

    drawText(user.score, canvas.width / 4, canvas.height / 5, "BLACK");
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5, "BLACK");

    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    drawCircle(ball.x, ball.y, ball.radius, ball.color);
  }

  useEffect(() => {
    canvas = canvasRef.current;
    context = canvas.getContext("2d");
    // socket.on("set", (data) => {
    // 	const newBall: Ball ={
    // 		x: data.x,
    // 		y: data.y,
    // 		radius: data.radius,
    // 		speed: data.speed,
    // 		velocityX: data.velocityX,
    // 		velocityY: data.velocityY,
    // 		color: data.color,
    // 	}
    // 	setBall(newBall);
    // 	canvas = canvasRef.current;
    // 	context = canvas.getContext("2d");
    // 	render();
    // })

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
      const updateCom = {
        x: data.playerB.x,
        y: data.playerB.y,
        width: 10,
        height: 100,
        color: "GRAY",
        score: data.playerB.score,
      };
      user.score = data.playerA.score;
      setBall(updateBall);
      setCom(updateCom);
    });

    function movePaddle(evt) {
      let rect = canvas.getBoundingClientRect();
      user.y = evt.clientY - rect.top - user.height / 2;
      socket.emit("paddleA", { roomId: "1", y: user.y });
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
