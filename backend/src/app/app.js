const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const { Server } = require('socket.io');

const envConfig = require('../config/env');

function buildApp() {
  const app = express();

  const allowedOrigin = envConfig.frontendOrigin || '*';

  // Socket.io is created in server bootstrap since it needs the underlying http server.
  // This function only sets up express.
  app.use(cors({ origin: allowedOrigin, credentials: true }));
  app.use(express.json());

  // Routes
  app.use('/api', require('../routes/ingest.routes'));
  app.use('/api', require('../routes/match.routes'));
  app.use('/api', require('../routes/relationships.routes'));
  app.use('/api/entities', require('../routes/entities.routes'));

  // Health
  app.get('/', (req, res) => res.send('MDM Backend Running'));

  // Error handler must be registered AFTER routes
  // eslint-disable-next-line global-require
  const errorHandler = require('../middleware/errorHandler');
  app.use(errorHandler);

  return app;
}

async function startApp({ httpServer }) {
  // socket.io attached to http server
  const io = new Server(httpServer, {
    cors: {
      origin: envConfig.frontendOrigin || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // eslint-disable-next-line global-require
  require('../sockets')(io);

  const app = buildApp();

  // Connect DB once app is ready
  await connectDB();

  return { app, io };
}

module.exports = { buildApp, startApp };

