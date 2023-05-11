import React from "react";
import { io } from "socket.io-client";
import * as dotenv from "dotenv";

export const socket = io(process.env.SOCKET_PORT);
console.log(socket);
export const SocketContext = React.createContext(socket);
