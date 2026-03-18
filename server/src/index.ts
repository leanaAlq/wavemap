import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerLocationNamespace } from './location';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT ?? 3000;

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

app.use(express.json());

// Health check — used to verify the server is up
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wavemap-server' });
});

registerLocationNamespace(io);

httpServer.listen(PORT, () => {
  console.log(`Wavemap server running on port ${PORT}`);
});
