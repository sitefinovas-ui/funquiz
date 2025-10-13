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

function getChromeDataDir() {
  if (chromeDataDir) return chromeDataDir;
  // Si CHROME_DATA_DIR est défini (ex: en prod), on l'utilise
  const fromEnv = process.env.CHROME_DATA_DIR;
  if (fromEnv) {
    chromeDataDir = fromEnv;
    return chromeDataDir;
  }
  // Sinon, créer un dossier temporaire unique pour éviter SingletonLock
  chromeDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wwebjs-chrome-"));
  return chromeDataDir;
}

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

const createClient = () =>
  new Client({
    authStrategy: new LocalAuth({ clientId: "FunQuizBot" }),
    puppeteer: {
      headless: process.env.HEADLESS !== "false",
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

// Méthode: initializeWhatsApp()
export const initializeWhatsApp = async (retries = 3) => {
  if (!waClient) {
    waClient = createClient();

    waClient.on("loading_screen", (percent, message) => {
      initializing = true;
      console.log(`⏳ WhatsApp loading: ${percent}% - ${message}`);
    });

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

    waClient.on("authenticated", () => {
      console.log("🔐 WhatsApp authentifié.");
    });

    waClient.on("ready", () => {
      waReady = true;
      initializing = false;
      console.log("✅ WhatsApp client prêt.");
    });

    waClient.on("auth_failure", (msg) => {
      initializing = false;
      waReady = false;
      console.error("❌ Échec d’auth WhatsApp:", msg);
    });

    waClient.on("disconnected", (reason) => {
      waReady = false;
      initializing = false;
      console.warn("⚠️ WhatsApp déconnecté:", reason);
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
      console.error("❌ Échec initialisation WhatsApp:", err.message);
      if (retries > 0) {
        console.log(`↻ Retry init WhatsApp (${retries} restants)`);
        return initializeWhatsApp(retries - 1);
      }
      throw err;
    }
  }
};

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