import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import puppeteer from "puppeteer";
import fs from "fs";
import os from "os";
import path from "path";

const { Client, LocalAuth } = pkg;

let waClient;
let waReady = false;
let initializing = false;
let lastQr = null;
let chromeDataDir = null;

/* ------------------ 📁 Gestion du dossier Chrome ------------------ */
function getChromeDataDir() {
  if (chromeDataDir) return chromeDataDir;

  const fromEnv = process.env.CHROME_DATA_DIR;
  if (fromEnv) {
    chromeDataDir = fromEnv;
    return chromeDataDir;
  }

  // Docker : crée un répertoire temporaire isolé pour Chrome
  chromeDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wwebjs-chrome-"));
  return chromeDataDir;
}

/* ------------------ 🔓 Correction bug SingletonLock ------------------ */
function ensureNoChromeSingletonLock(dir) {
  try {
    const lockPath = path.join(dir, "SingletonLock");
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log("🔓 SingletonLock supprimé :", lockPath);
    }
  } catch (e) {
    console.warn("⚠️ Impossible de supprimer SingletonLock :", e.message);
  }
}

/* ------------------ 🧭 Détection du bon binaire Chrome ------------------ */
function resolveChromiumPath() {
  const envPath = process.env.CHROMIUM_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ].filter((p) => fs.existsSync(p));

  if (candidates.length > 0) return candidates[0];
  return puppeteer.executablePath();
}

/* ------------------ 🤖 Création du client WhatsApp ------------------ */
const createClient = () =>
  new Client({
    authStrategy: new LocalAuth({ clientId: "FunQuizBot" }),
    puppeteer: {
      headless: process.env.HEADLESS !== "false", // true par défaut
      executablePath: resolveChromiumPath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-zygote",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        `--user-data-dir=${getChromeDataDir()}`,
      ],
    },
  });

/* ------------------ 🚀 Initialisation principale ------------------ */
export const initializeWhatsApp = async (retries = 3) => {
  if (!waClient) {
    waClient = createClient();

    waClient.on("loading_screen", (percent, message) => {
      initializing = true;
      console.log(`⏳ WhatsApp loading: ${percent}% - ${message}`);
    });

    waClient.on("qr", (qr) => {
      lastQr = qr;
      console.log("📲 QR Code reçu. Scannez-le dans WhatsApp !");
      try {
        qrcode.generate(qr, { small: true });
      } catch (e) {
        console.warn("⚠️ Impossible d'afficher le QR en ASCII:", e.message);
      }
    });

    waClient.on("authenticated", () => {
      console.log("🔐 WhatsApp authentifié !");
    });

    waClient.on("ready", () => {
      waReady = true;
      initializing = false;
      console.log("✅ WhatsApp client prêt !");
    });

    waClient.on("auth_failure", (msg) => {
      waReady = false;
      initializing = false;
      console.error("❌ Échec d’authentification WhatsApp:", msg);
    });

    waClient.on("disconnected", async (reason) => {
      console.warn("⚠️ WhatsApp déconnecté:", reason);
      waReady = false;
      initializing = false;
      console.log("↻ Tentative de reconnexion...");
      await initializeWhatsApp();
    });
  }

  if (!initializing && !waReady) {
    try {
      const dir = getChromeDataDir();
      ensureNoChromeSingletonLock(dir);
      console.log("🗂️ Profil Chrome utilisé:", dir);
      initializing = true;
      await waClient.initialize();
    } catch (err) {
      initializing = false;
      console.error("❌ Erreur d’initialisation WhatsApp:", err.message);
      if (retries > 0) {
        console.log(`↻ Nouvelle tentative (${retries - 1} restantes)`);
        return initializeWhatsApp(retries - 1);
      }
      throw err;
    }
  }
};

/* ------------------ 🧩 Fonctions utilitaires ------------------ */
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
  throw new Error("WhatsApp non connecté");
};

export const getWhatsAppStatus = () => ({
  ready: waReady,
  wid: waClient?.info?.wid || null,
  initializing,
});

export const getLastQr = () => lastQr;
export { waClient };
