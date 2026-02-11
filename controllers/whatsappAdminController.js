import QRCode from "qrcode";
import {
  getLastQr,
  getWhatsAppStatus,
  initializeWhatsApp,
  waClient,
} from "../utils/whatsapp.js";

const waitForQr = async (timeoutMs = 15000) => {
  if (getLastQr()) return getLastQr();

  const client = waClient;
  if (!client) return null;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      try {
        client.off("qr", onQr);
      } catch {}
      resolve(null);
    }, timeoutMs);

    const onQr = (qr) => {
      clearTimeout(timer);
      try {
        client.off("qr", onQr);
      } catch {}
      resolve(qr);
    };

    client.on("qr", onQr);
  });
};

export const getWhatsAppQrForAdmin = async (req, res) => {
  try {
    await initializeWhatsApp();

    const status = getWhatsAppStatus();
    let qr = getLastQr();

    if (!qr && !status.ready) {
      qr = await waitForQr(15000);
    }

    if (!qr) {
      return res.status(200).json({
        status,
        qrAvailable: false,
        qrDataUrl: null,
        message: status.ready
          ? "Client WhatsApp déjà prêt (pas de QR)"
          : "En attente du QR (réessaie dans quelques secondes)",
      });
    }

    const qrDataUrl = await QRCode.toDataURL(qr, {
      errorCorrectionLevel: "M",
      width: 320,
      margin: 1,
    });

    return res.status(200).json({
      status,
      qrAvailable: true,
      qrDataUrl,
    });
  } catch (e) {
    return res.status(500).json({
      error: "Impossible de générer le QR WhatsApp",
      details: e?.message,
    });
  }
};

