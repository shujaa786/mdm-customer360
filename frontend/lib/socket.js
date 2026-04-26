import { io } from "socket.io-client";
import { getSocketUrl } from "../src/lib/env";

const socketUrl = getSocketUrl();

const socket = io(socketUrl || 'http://localhost:5000', {
  transports: ['websocket'],
  withCredentials: true
});

export default socket;