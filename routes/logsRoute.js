import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, authorizeRole } from '../middleware/authentification.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, '../server.log');

router.get('/logs', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 500, 5000));
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return res.status(200).json({ lines: [], message: 'Aucun log pour le moment.' });
    }
    const data = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = data.split('\n').filter(Boolean);
    const last = lines.slice(-limit);
    return res.status(200).json({ lines: last, total: lines.length });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lecture des logs', details: err.message });
  }
});

export default router;