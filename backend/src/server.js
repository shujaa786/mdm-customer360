require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./configs/db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use('/api', require('./routes/ingest'));
app.use('/api', require('./routes/match'));
connectDB();

// Routes will be added later
app.get('/', (req, res) => res.send('MDM Backend Running'));

// Socket.io
require('./sockets')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));