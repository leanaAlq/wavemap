import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Health check — used to verify the server is up
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wavemap-server' });
});

app.listen(PORT, () => {
  console.log(`Wavemap server running on http://localhost:${PORT}`);
});
