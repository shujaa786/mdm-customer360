require('dotenv').config();

const http = require('http');
const envConfig = require('./config/env');
const { startApp } = require('./app/app');

const server = http.createServer();

(async () => {
  const { app, io } = await startApp({ httpServer: server });
  app.set('io', io);

  const PORT = envConfig.port || process.env.PORT || 5000;

  server.on('request', app);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${envConfig.env})`);
    console.log(`CORS/Socket origin: ${envConfig.frontendOrigin || '*'}`);
  });
})();

