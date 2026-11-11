import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import carparkHandler from './api/carparkavailability.ts';
import busArrivalHandler from './api/busarrival.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Route Mappings (delegating to serverless /api handlers)
  app.all('/api/health', healthHandler);
  app.all('/api/carparkavailability', carparkHandler);
  app.all('/api/busarrival', busArrivalHandler);

  // Fallback aliases for convenience
  app.all('/api/carparks', carparkHandler);
  app.all('/api/bus/04121', (req, res) => {
    req.query.BusStopCode = '04121';
    return busArrivalHandler(req, res);
  });

  if (!isProduction) {
    // Mount Vite middleware in development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
