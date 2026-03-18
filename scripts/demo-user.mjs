// Simulates a second user for demo/video recording purposes.
// Usage: DEMO_SERVER=https://wavemap.up.railway.app node scripts/demo-user.mjs
//
// Connects to the /location namespace as a fake user with a hardcoded
// location + track, so the map shows two pins without a second real device.
import { io } from 'socket.io-client';
import { randomUUID } from 'crypto';

const SERVER = process.env.DEMO_SERVER ?? 'http://localhost:3000';
const sessionId = randomUUID();

const socket = io(`${SERVER}/location`, { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Demo user connected:', socket.id);
  emitLocation();
  setInterval(emitLocation, 15_000);
});

socket.on('connect_error', (err) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});

function emitLocation() {
  socket.emit('location:update', {
    sessionId,
    latitude: 55.9441,   // Nicholson Street, Edinburgh
    longitude: -3.1855,
    updatedAt: new Date().toISOString(),
    track: {
      id: 'demo',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    },
  });
  console.log('Emitted location at', new Date().toISOString());
}
