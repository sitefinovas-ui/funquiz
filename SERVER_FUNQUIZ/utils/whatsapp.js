import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg;

let waClient;
let waReady = false;
let initializing = false;

const createClient = () =>
  new Client({
    authStrategy: new LocalAuth({ clientId: "FunQuizBot" }),
    puppeteer: {
      headless: process.env.HEADLESS !== "false",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--remote-debugging-port=9222",
      ],
      executablePath: process.env.CHROMIUM_PATH || undefined,
    },
  });

export const initializeWhatsApp = async (retries = 3) => {
  if (waReady && waClient) return waClient;
  if (initializing) return waClient;

  if (!waClient) {
    waClient = createClient();

    waClient.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log("📲 QR Code généré. Scannez avec WhatsApp.");
    });

    waClient.on("ready", () => {
      waReady = true;
      initializing = false;
      console.log("✅ WhatsApp client prêt");
    });

    waClient.on("auth_failure", (msg) => {
      console.error("❌ Auth failure:", msg);
    });

    waClient.on("disconnected", (reason) => {
      console.warn("⚠️ WhatsApp déconnecté :", reason);
      waReady = false;
      initializing = false;
      console.log("♻️ Tentative de reconnexion dans 5 secondes...");
      setTimeout(() => initializeWhatsApp(retries), 5000);
    });

    process.on("SIGINT", async () => {
      try {
        await waClient.destroy();
      } catch {}
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      try {
        await waClient.destroy();
      } catch {}
      process.exit(0);
    });
  }

  initializing = true;
  try {
    await waClient.initialize();
    return waClient;
  } catch (err) {
    initializing = false;
    console.error("💥 Erreur init WhatsApp:", err.message);
    if (retries > 0) {
      console.log(`♻️ Reconnexion dans 5s... (${retries} essais restants)`);
      await new Promise((res) => setTimeout(res, 5000));
      return initializeWhatsApp(retries - 1);
    }
    throw err;
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

export { waClient };