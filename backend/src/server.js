require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./configs/db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const rawEnv = (process.env.APP_ENV || process.env.NODE_ENV || 'STAGING').toUpperCase();
const isProd = rawEnv === 'PROD' || rawEnv === 'PRODUCTION';
const currentEnv = isProd ? 'PROD' : 'STAGING';

const frontendOrigin = isProd
  ? (process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL_PRODUCTION)
  : (process.env.FRONTEND_URL_STAGING || process.env.FRONTEND_URL_DEV);

const allowedOrigin = frontendOrigin || '*';

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use('/api', require('./routes/ingest'));
app.use('/api', require('./routes/match'));
app.use('/api/entities', require('./routes/entities'));
app.set('io', io);
connectDB();

// Routes will be added later
app.get('/', (req, res) => res.send('MDM Backend Running'));

// Socket.io
require('./sockets')(io);

const envPort = isProd
  ? (process.env.PORT_PROD || process.env.PORT_PRODUCTION)
  : (process.env.PORT_STAGING || process.env.PORT_DEV);
const PORT = envPort || process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${currentEnv})`);
  console.log(`CORS/Socket origin: ${allowedOrigin}`);
});