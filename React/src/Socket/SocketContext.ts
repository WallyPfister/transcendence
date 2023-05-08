import React from "react";
import { io } from "socket.io-client";

export const socket = io("http://localhost:3001");
console.log(socket);
export const SocketContext = React.createContext(socket);