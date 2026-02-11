import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, '../server.log');

export const logger = (req, res, next) => {
  // Récupère l'IP du client
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${clientIp}\n`;
  console.log(line.trim());

  try {
    fs.appendFile(LOG_FILE, line, (err) => {
      if (err) {
        console.error('❌ Erreur écriture log:', err.message);
      }
    });
  } catch (e) {
    console.error('❌ Exception écriture log:', e.message);
  }

  next();
};
