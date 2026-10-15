import dotenv from 'dotenv';
// Load environment variables before anything else
dotenv.config();

import http from 'http';
import app from './app';
import { logger } from './utils/logger';
import { initSocket } from './socket';
import { whatsappService } from './modules/whatsapp/whatsapp.service';

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const startServer = async () => {
  try {
    server.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);

      // Automatically initialize WhatsApp client in the background
      whatsappService.initialize().catch(err => {
        logger.error('Failed to auto-initialize WhatsApp:', err);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown — ts-node-dev sends SIGTERM before restarting.
// We must close the server and destroy the WhatsApp/Puppeteer process
// so the port is freed before the new instance starts.
const shutdown = async () => {
  server.close();
  try { await whatsappService.destroy(); } catch (_) { }
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
