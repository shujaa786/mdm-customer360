import { io } from 'socket.io-client';
import { getSocketUrl } from './env';

let socketUrl;
try {
  socketUrl = getSocketUrl();
} catch (e) {
  socketUrl = undefined;
}

const socket = io(socketUrl || 'http://localhost:5000', {
  transports: ['websocket'],
  withCredentials: true
});

export default socket;
