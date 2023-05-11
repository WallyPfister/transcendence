import React from "react";
import { io } from "socket.io-client";
import * as dotenv from "dotenv";

export const socket = io(process.env.REACT_APP_SOCKET_PORT);
console.log(process.env.REACT_APP_SOCKET_PORT);
export const SocketContext = React.createContext(socket);
