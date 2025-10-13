// Module util WhatsApp: createClient, initializeWhatsApp, QR handlers
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import puppeteer from "puppeteer";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

const { Client, LocalAuth } = pkg;
let waClient;
let waReady = false;
let initializing = false;
let lastQr = null;

// Obtenir __dirname en ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer un dossier unique pour chaque session
const SESSION_DIR = path.join(__dirname, '.wwebjs_auth');

// S'assurer que le dossier existe
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// Supprimer le fichier SingletonLock s'il existe
function cleanupSingletonLock() {
  try {
    const lockPath = path.join(SESSION_DIR, 'session-FunQuizBot', 'SingletonLock');
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log("🔓 SingletonLock supprimé");
    }
  } catch (err) {
    console.warn("⚠️ Impossible de supprimer SingletonLock:", err.message);
  }
}

// Nettoyer avant de créer le client
cleanupSingletonLock();

// Utiliser un dossier temporaire unique pour le profil Chrome
function getTempChromeDir() {
  const isRender = process.env.RENDER === 'true';
  // Sur Render, utiliser un chemin fixe pour la persistance entre redémarrages
  if (isRender) {
    const dir = '/tmp/chrome-data';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
  // En local, utiliser un dossier temporaire unique
  return fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-'));
}

// Trouver le meilleur chemin pour Chromium
function findChromiumPath() {
  // 1. Préférer le chemin explicite s'il existe
  if (process.env.PUPPETEER_EXECUTABLE_PATH && 
      fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  
  // 2. Utiliser le Chromium de Puppeteer
  return puppeteer.executablePath();
}

// Simplified client: use Puppeteer's bundled Chromium
function createClient() {
  const tempDir = getTempChromeDir();
  console.log("📁 Dossier Chrome:", tempDir);
  
  return new Client({
    authStrategy: new LocalAuth({ clientId: "FunQuizBot" }),
    puppeteer: {
      headless: process.env.HEADLESS !== "false",
      executablePath: findChromiumPath(),
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--disable-gpu",
        `--user-data-dir=${tempDir}`
      ],
    },
  });
}

// Initialise et branche les handlers (QR/ready)
export const initializeWhatsApp = async () => {
  if (!waClient) {
    waClient = createClient();

    waClient.on("qr", (qr) => {
      lastQr = qr;
      console.log("QR RECEIVED:", qr);
      try {
        qrcode.generate(qr, { small: true });
      } catch (e) {
        console.warn("QR ASCII render failed:", e.message);
      }
      console.log("📲 QR Code généré. Scannez avec WhatsApp.");
    });

    waClient.on("ready", () => {
      waReady = true;
      initializing = false;
      console.log("✅ WhatsApp client prêt.");
    });

    waClient.on("auth_failure", (msg) => {
      initializing = false;
      waReady = false;
      console.error("❌ Échec d'auth WhatsApp:", msg);
    });

    waClient.on("disconnected", (reason) => {
      waReady = false;
      initializing = false;
      console.warn("⚠️ WhatsApp déconnecté:", reason);
    });
  }

  if (!initializing && !waReady) {
    initializing = true;
    await waClient.initialize();
  }
}

// Vérifie que le client WhatsApp est prêt
export const ensureWhatsAppReady = async () => {
  if (waReady) return;
  await initializeWhatsApp();
  if (waReady) return;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("WhatsApp non prêt")), 15000);
    waClient.once("ready", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
};

// Attendre état CONNECTED (plus strict que "ready")
export const ensureWhatsAppConnected = async (timeoutMs = 30000) => {
  await ensureWhatsAppReady();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const state = await waClient.getState();
      if (state === "CONNECTED") return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("WhatsApp non connecté (state != CONNECTED)");
};

export const getWhatsAppStatus = () => ({
  ready: waReady,
  wid: waClient?.info?.wid || null,
  initializing,
});

export const getLastQr = () => lastQr;
export { waClient };

// Supprimer cette ligne qui cause l'erreur
// export default client;