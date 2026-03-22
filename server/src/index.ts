import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { registerLocationNamespace } from './location/namespace';
import { migrate } from './db';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Health check — used to verify the server is up
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'radii-server' });
});

// Socket.io requires an http.Server — cannot attach to the express app directly
const httpServer = createServer(app);

const io = new Server(httpServer, {
  // Allow all origins during development; lock this down before production
  cors: { origin: '*' },
});

registerLocationNamespace(io);

migrate().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Radii server running on http://localhost:${PORT}`);
    console.log(`Socket.io /location namespace ready`);
  });
});
