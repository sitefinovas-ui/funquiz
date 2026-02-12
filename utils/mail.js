import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const stripWrappingQuotes = (value) => {
  const s = String(value || "").trim();
  if (s.length >= 2) {
    const first = s[0];
    const last = s[s.length - 1];
    if ((first === `"` && last === `"`) || (first === `'` && last === `'`)) {
      return s.slice(1, -1).trim();
    }
  }
  return s;
};

const smtpUserSource = process.env.SMTP_USER
  ? "SMTP_USER"
  : process.env.EMAIL_USER
    ? "EMAIL_USER"
    : process.env.EMAIL
      ? "EMAIL"
      : "";
const smtpUser = stripWrappingQuotes(
  process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL || ""
);
// Gmail "App Password" est souvent affiché avec des espaces: "xxxx xxxx xxxx xxxx"
// Nodemailer attend la valeur sans espaces.
const smtpPassSource = process.env.SMTP_PASS
  ? "SMTP_PASS"
  : process.env.EMAIL_PASS
    ? "EMAIL_PASS"
    : process.env.EMAIL_PASSWORD
      ? "EMAIL_PASSWORD"
      : process.env.PASSWORD
        ? "PASSWORD"
        : "";
const smtpPass = stripWrappingQuotes(
  process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.PASSWORD ||
    ""
).replace(/\s+/g, "");

const smtpService = stripWrappingQuotes(process.env.SMTP_SERVICE || "gmail");
const smtpHost = stripWrappingQuotes(process.env.SMTP_HOST || "");
const smtpPortRaw = stripWrappingQuotes(process.env.SMTP_PORT || "");
const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : undefined;
const smtpSecureEnv = stripWrappingQuotes(process.env.SMTP_SECURE || "").toLowerCase();
const smtpSecure = smtpSecureEnv === "true";
const smtpPoolEnv = stripWrappingQuotes(process.env.SMTP_POOL || "").toLowerCase();
const smtpPool = smtpPoolEnv ? smtpPoolEnv === "true" : false;
const smtpConnectionTimeoutMs =
  Number(stripWrappingQuotes(process.env.SMTP_CONNECTION_TIMEOUT_MS || process.env.SMTP_CONNECTION_TIMEOUT || "")) ||
  20000;
const smtpGreetingTimeoutMs =
  Number(stripWrappingQuotes(process.env.SMTP_GREETING_TIMEOUT_MS || process.env.SMTP_GREETING_TIMEOUT || "")) ||
  20000;
const smtpSocketTimeoutMs =
  Number(stripWrappingQuotes(process.env.SMTP_SOCKET_TIMEOUT_MS || process.env.SMTP_SOCKET_TIMEOUT || "")) ||
  30000;

const mailProvider = stripWrappingQuotes(process.env.MAIL_PROVIDER || "").toLowerCase();
const resendApiKey = stripWrappingQuotes(process.env.RESEND_API_KEY || "");

const mailFrom = stripWrappingQuotes(process.env.MAIL_FROM || "");
const mailFromEmail = stripWrappingQuotes(process.env.MAIL_FROM_EMAIL || "");

const maskEmail = (value) => {
  const email = String(value || "").trim();
  if (!email) return "";
  const at = email.indexOf("@");
  if (at <= 1) return "***";
  const user = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${user.slice(0, 2)}***@${domain}`;
};

const buildFrom = (displayName = "FunQuiz") => {
  // Permet de forcer le from globalement (ex: '"FunQuiz" <noreply@domaine.com>')
  if (mailFrom) {
    if (mailFrom.includes("<") && mailFrom.includes(">")) return mailFrom;
    return `"${displayName}" <${mailFrom}>`;
  }

  // Sinon, on garde le nom (emoji OK) et on injecte une adresse valide/configurée
  const address = mailFromEmail || smtpUser;
  if (address) return `"${displayName}" <${address}>`;

  // Fallback ultime (évite d'exploser le code si l'env est vide)
  return `"${displayName}" <no-reply@funquiz.com>`;
};

const extractDisplayName = (fromValue) => {
  const raw = String(fromValue || "").trim();
  if (!raw) return "FunQuiz";
  const m = raw.match(/^\s*"?([^"<]*)"?\s*<[^>]+>\s*$/);
  const name = String(m?.[1] || "").trim();
  return name || "FunQuiz";
};

const patchFrom = (fromValue) => {
  const raw = String(fromValue || "").trim();
  // Si un from "réel" est fourni (pas le no-reply hardcodé), on le respecte.
  if (raw && !/no-reply@funquiz\.com/i.test(raw)) return raw;
  return buildFrom(extractDisplayName(raw));
};

let transporter;
const getTransporter = () => {
  if (transporter) return transporter;

  if (smtpHost) {
    const port = Number.isFinite(smtpPort) && smtpPort > 0 ? smtpPort : 587;
    const secure = smtpSecureEnv ? smtpSecure : port === 465;
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
      pool: smtpPool,
      connectionTimeout: smtpConnectionTimeoutMs,
      greetingTimeout: smtpGreetingTimeoutMs,
      socketTimeout: smtpSocketTimeoutMs,
    });
    return transporter;
  }

  const serviceOverrides = {
    ...(Number.isFinite(smtpPort) && smtpPort > 0 ? { port: smtpPort } : {}),
    ...(smtpSecureEnv ? { secure: smtpSecure } : {}),
  };

  transporter = nodemailer.createTransport({
    service: smtpService || "gmail",
    auth: { user: smtpUser, pass: smtpPass },
    pool: smtpPool,
    connectionTimeout: smtpConnectionTimeoutMs,
    greetingTimeout: smtpGreetingTimeoutMs,
    socketTimeout: smtpSocketTimeoutMs,
    ...serviceOverrides,
  });
  return transporter;
};

let warnedMissingMailConfig = false;
const ensureMailConfigured = (context) => {
  const configured = Boolean(smtpUser) && Boolean(smtpPass);
  if (configured) return true;

  if (!warnedMissingMailConfig) {
    warnedMissingMailConfig = true;
    console.warn(
      `[mail] SMTP non configuré: définis SMTP_USER/SMTP_PASS (ou EMAIL/EMAIL_PASSWORD). user=${maskEmail(
        smtpUser
      )} context=${context}`
    );
  }
  return false;
};

const sendMailSafe = async (emailContent, context) => {
  const ctx = String(context || emailContent?.subject || emailContent?.to || "mail");
  if (process.env.DISABLE_EMAILS === "true") {
    const err = new Error("Emails désactivés (DISABLE_EMAILS=true)");
    err.code = "EMAILS_DISABLED";
    throw err;
  }

  const patchedEmailContent = {
    ...emailContent,
    from: patchFrom(emailContent?.from),
  };

  if (mailProvider === "resend") {
    if (!resendApiKey) {
      const err = new Error("RESEND_API_KEY manquant (MAIL_PROVIDER=resend)");
      err.code = "RESEND_NOT_CONFIGURED";
      throw err;
    }

    const from = String(patchedEmailContent?.from || "").trim();
    const to = Array.isArray(patchedEmailContent?.to)
      ? patchedEmailContent.to
      : [patchedEmailContent?.to].filter(Boolean);
    const subject = String(patchedEmailContent?.subject || "").trim();
    const html = String(patchedEmailContent?.html || "");

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      const msg = data?.message || `Resend error (${resp.status})`;
      const err = new Error(msg);
      err.code = "RESEND_SEND_FAILED";
      err.details = data;
      throw err;
    }

    return data;
  }

  if (!ensureMailConfigured(ctx)) {
    const err = new Error("Service email non configuré (identifiants SMTP manquants)");
    err.code = "MAIL_NOT_CONFIGURED";
    throw err;
  }

  const transport = getTransporter();
  return transport.sendMail(patchedEmailContent);
};

if (process.env.NODE_ENV === "production") {
  const kind = mailProvider === "resend" ? "resend" : smtpHost ? "smtp" : `service:${smtpService || "gmail"}`;
  const configured =
    mailProvider === "resend"
      ? Boolean(resendApiKey)
      : Boolean(smtpUser) && Boolean(smtpPass);
  const fromAddr = (() => {
    if (mailFrom) {
      const m = mailFrom.match(/<([^>]+)>/);
      return String((m ? m[1] : mailFrom) || "").trim();
    }
    return String(mailFromEmail || smtpUser || "").trim();
  })();

  console.log(
    `[mail] provider=${kind} configured=${configured ? "yes" : "no"} user=${maskEmail(smtpUser)} from=${maskEmail(fromAddr)} userSource=${smtpUserSource || "n/a"} passSource=${smtpPassSource || "n/a"}`
  );

  if (smtpPassSource === "PASSWORD") {
    console.warn(
      "[mail] Astuce: en production, évite la variable PASSWORD (souvent utilisée par des addons). Préfère SMTP_PASS ou EMAIL_PASS."
    );
  }
}

// -----------------------------
// 1️⃣ Email d'inscription
// -----------------------------
export const mailInscription = async (email, first_name) => {
  try {
    const emailContent = {
      from: '"FunQuiz" <no-reply@funquiz.com>',
      to: email,
      subject: "Bienvenue sur FunQuiz 🎉",
      html: `
                <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                    <div style="padding:20px;text-align:center;">
                        <h1 style="color:#000; font-size:22px; margin:0;">Bienvenue ${first_name} !</h1>
                        <p>Merci de vous être inscrit sur FunQuiz. Amusez-vous bien !</p>
                    </div>
                </div>
            `,
    };

    await sendMailSafe(emailContent);
    return { success: true, message: "Email d’inscription envoyé avec succès" };
  } catch (error) {
    console.error("Erreur envoi email inscription:", error);
    return { success: false, message: error.message };
  }
};
// -----------------------------
// 2️⃣ Email de connexion
// -----------------------------
export const mailConnected = async (email, firstName, userIP) => {
  try {
    const emailContent = {
      from: '"FunQuiz" <no-reply@funquiz.com>',
      to: email,
      subject: "Nouvelle connexion détectée 🔐",
      html: `
                <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                    <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
                        <h1 style="color:#ffffff;">Connexion à votre compte</h1>
                    </div>
                    <div style="padding:20px;">
                        <p>Bonjour ${firstName}, nous avons détecté une nouvelle connexion à votre compte FunQuiz depuis l'IP : ${userIP}.</p>
                        <p>Si ce n'était pas vous, veuillez changer votre mot de passe immédiatement.</p>
                    </div>
                </div>
            `,
    };

    await sendMailSafe(emailContent);
    return { success: true, message: "Email de connexion envoyé avec succès" };
  } catch (error) {
    console.error("Erreur envoi email connexion:", error);
    return { success: false, message: error.message };
  }
};
// -----------------------------
// 3️⃣ Email de réinitialisation du mot de passe
// -----------------------------
export const sendResetCodeEmail = async (email, firstName, resetCode) => {
  try {
    const emailContent = {
      from: '"FunQuiz" <no-reply@funquiz.com>',
      to: email,
      subject: "Réinitialisation de votre mot de passe 🔑",
      html: `
                <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;">
                    <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
                        <h1 style="color:#ffffff;">Réinitialisation du mot de passe</h1>
                    </div>
                    <div style="padding:20px;">
                        <p>Bonjour ${firstName},</p>
                        <p>Vous avez demandé à réinitialiser votre mot de passe. Utilisez ce code pour continuer :</p>
                        <h2 style="text-align:center;color:#1c1c1c;">${resetCode}</h2>
                        <p>Si vous n'avez pas demandé ce changement, ignorez ce mail.</p>
                    </div>
                </div>
            `,
    };

    await sendMailSafe(emailContent);
    return {
      success: true,
      message: "Code de réinitialisation envoyé par email",
    };
  } catch (error) {
    console.error("Erreur envoi email réinitialisation:", error);
    return { success: false, message: error.message };
  }
};

export const sendOtpEmail = async (email, firstName, otpCode, ttlMinutes = 10) => {
  try {
    const emailContent = {
      from: '"FunQuiz" <no-reply@funquiz.com>',
      to: email,
      subject: "Code de vérification FunQuiz 🔐",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;">
          <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
            <h1 style="color:#ffffff;">Vérification du compte</h1>
          </div>
          <div style="padding:20px;">
            <p>Bonjour ${firstName || ""},</p>
            <p>Voici votre code de vérification :</p>
            <h2 style="text-align:center;color:#1c1c1c;">${otpCode}</h2>
            <p>Ce code est valable ${ttlMinutes} minutes.</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce mail.</p>
          </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return { success: true, message: "Code OTP envoyé par email" };
  } catch (error) {
    console.error("Erreur envoi email OTP:", error);
    return { success: false, message: error.message };
  }
};
// -----------------------------
// Email de suppression de compte
// -----------------------------
export const mailAccountDeleted = async (email, first_name) => {
  try {
    const emailContent = {
      from: '"FunQuiz" <no-reply@funquiz.com>',
      to: email,
      subject: "Compte supprimé sur FunQuiz 🗑️",
      html: `
                <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                    <div style="padding:20px;text-align:center;">
                        <h1 style="color:#000; font-size:22px; margin:0;">Bonjour ${first_name},</h1>
                        <p>Votre compte FunQuiz a été supprimé avec succès.</p>
                        <p>Si vous changez d’avis, vous pouvez nous contacter pour réactiver votre compte.</p>
                    </div>
                </div>
            `,
    };

    await sendMailSafe(emailContent);
    return {
      success: true,
      message: "Email de suppression envoyé avec succès",
    };
  } catch (error) {
    console.error("Erreur envoi email suppression compte:", error);
    return { success: false, message: error.message };
  }
};
// -----------------------------
// Fonction d’envoi mail mise à jour profil
// -----------------------------
export const mailUpdateProfile = async (email, first_name) => {
  if (process.env.DISABLE_EMAILS === "true") {
    return { skipped: true };
  }
  try {
    const emailContent = {
      from: `"FunQuiz 🔔" <no-reply@funquiz.com>`,
      to: email,
      subject: "Mise à jour de votre profil ✅",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Mise à jour du profil</h1>
          </div>
          <div style="padding:20px;">
            <h2>Bonjour ${first_name},</h2>
            <p>Votre profil a été mis à jour avec succès. Voici les changements :</p>
            <div style="background:#f5f5f5;border-radius:4px;padding:15px;margin:15px 0;">
              <ul style="list-style-type:none;padding:0;margin:0;">
               
              </ul>
            </div>
            <p style="color:#d32f2f;font-weight:500;">Si vous n'avez pas fait ces modifications, contactez notre support immédiatement.</p>
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
              <p style="color:#666;margin:0;">🚀 L'équipe FunQuiz</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return {
      success: true,
      message: "Email de modification envoyé avec succès",
    };
  } catch (error) {
    console.error("❌ Erreur mailUpdateProfile:", error);
    return { success: false, message: error.message };
  }
};
// -----------------------------
// Fonction d’envoi inscription newsletter
// -----------------------------
export const mailNewsletterSubscription = async (email) => {
  try {
    const emailContent = {
      from: `"FunQuiz 📰" <no-reply@funquiz.com>`,
      to: email,
      subject: "Bienvenue dans la newsletter FunQuiz! 🎉",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Bienvenue dans la newsletter FunQuiz!</h1>
          </div> 
            <div style="padding:20px;">
                <h2>Bonjour,</h2>
                <p>Merci de vous être abonné à notre newsletter. Vous recevrez bientôt les dernières nouvelles et mises à jour de FunQuiz.</p>
                <p>Nous sommes ravis de vous compter parmi nos abonnés !</p>
                <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
                    <p style="color:#666;margin:0;">🚀 L'équipe FunQuiz</p>
                    </div>
            </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return {
      success: true,
      message: "Email d’inscription à la newsletter envoyé avec succès",
    };
  } catch (error) {
    console.error("❌ Erreur mailNewsletterSubscription:", error);
    return { success: false, message: error.message };
  }
};
// -----------------------------
// Fonction d’envoi désinscription newsletter
// -----------------------------
export const mailNewsletterUnsubscription = async (email) => {
  try {
    const emailContent = {
      from: `"FunQuiz 📰" <no-reply@funquiz.com>`,
      to: email,
      subject: "Vous êtes désabonné de la newsletter FunQuiz 😢",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Désabonnement de la newsletter FunQuiz</h1>
          </div>
            <div style="padding:20px;">
                <h2>Bonjour,</h2>
                <p>Vous avez été désabonné de notre newsletter. Nous sommes désolés de vous voir partir !</p>
                <p>Si vous changez d'avis, vous pouvez toujours vous réabonner à tout moment.</p>
                <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
                    <p style="color:#666;margin:0;">🚀 L'équipe FunQuiz</p>
                    </div>
            </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return {
      success: true,
      message: "Email de désinscription à la newsletter envoyé avec succès",
    };
  } catch (error) {
    console.error("❌ Erreur mailNewsletterUnsubscription:", error);
    return { success: false, message: error.message };
  }
};
// -----------------------------
// Fonction d’envoi désinscription newsletter
// -----------------------------
export const mailMessageReceived = async (email, name, subject, userContent) => {
  try {
    const emailContent = {
      from: `"FunQuiz Support 📥" <no-reply@funquiz.com>`,
      to: email,
      subject: `Nous avons bien reçu votre message${subject ? ` — ${subject}` : ''}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Accusé de réception</h1>
          </div>
          <div style="padding:20px;">
            <h2>Bonjour ${name || 'Utilisateur'},</h2>
            <p>Merci pour votre message. Notre équipe l'a bien reçu et vous répondra rapidement.</p>
            ${subject ? `<p><strong>Sujet :</strong> ${subject}</p>` : ''}
            ${userContent ? `
              <div style="background:#f5f5f5;border-radius:4px;padding:15px;margin:15px 0;">
                <p style="margin:0;line-height:1.6;">${userContent}</p>
              </div>
            ` : ''}
            <p>Vous pouvez répondre directement à cet email pour nous fournir plus de détails si besoin.</p>
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
              <p style="color:#666;margin:0;">🚀 L'équipe FunQuiz</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return { success: true, message: "Accusé de réception envoyé" };
  } catch (error) {
    console.error("❌ Erreur mailMessageReceived:", error);
    return { success: false, message: error.message };
  }
};

export const senMailNews = async (email, subject, userContent) => {
  try {
    const emailContent = {
      from: `"FunQuiz Support 📥" <no-reply@funquiz.com>`,
      to: email,
      subject: `${subject ? ` — ${subject}` : ''}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
         
          <div style="padding:20px;">
            ${subject ? `<p><strong>Sujet :</strong> ${subject}</p>` : ''}
            ${userContent ? `
              <div style="background:#f5f5f5;border-radius:4px;padding:15px;margin:15px 0;">
                <p style="margin:0;line-height:1.6;">${userContent}</p>
              </div>
            ` : ''}
            <p>Vous pouvez répondre directement à cet email pour nous fournir plus de détails si besoin.</p>
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
              <p style="color:#666;margin:0;">🚀 L'équipe FunQuiz</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return { success: true, message: "Accusé de réception envoyé" };
  } catch (error) {
    console.error("❌ Erreur mailMessageReceived:", error);
    return { success: false, message: error.message };
  }
};
export const mailMessageReply = async (email, name, content, subject = "Réponse à votre message") => {
  try {
    const emailContent = {
      from: `"FunQuiz Support 📬" <no-reply@funquiz.com>`,
      to: email,
      subject,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Réponse de l'équipe FunQuiz</h1>
          </div>
          <div style="padding:20px;">
            <h2>Bonjour ${name || 'Utilisateur'},</h2>
            <p>Nous avons répondu à votre demande :</p>
            <div style="background:#f5f5f5;border-radius:4px;padding:15px;margin:15px 0;">
              <p style="margin:0;line-height:1.6;">${content}</p>
            </div>
            <p>Si vous avez d'autres questions, répondez simplement à cet email.</p>
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
              <p style="color:#666;margin:0;">🚀 L'équipe FunQuiz</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return { success: true, message: "Email de réponse envoyé" };
  } catch (error) {
    console.error("❌ Erreur mailMessageReply:", error);
    return { success: false, message: error.message };
  }
};

export const mailAdminDirect = async ({ email, name, firstname, subject, content }) => {
  if (process.env.DISABLE_EMAILS === "true") {
    return { skipped: true };
  }
  try {
    const safeSubject = String(subject || "").trim() || "Message FunQuiz";
    const recipientName = firstname || name || "Utilisateur";
    const body = String(content || "").trim();

    const emailContent = {
      from: `"FunQuiz" <no-reply@funquiz.com>`,
      to: email,
      subject: safeSubject,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#333;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background-color:#1c1c1c;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Message FunQuiz</h1>
          </div>
          <div style="padding:20px;">
            <h2>Bonjour ${recipientName},</h2>
            <div style="background:#f5f5f5;border-radius:4px;padding:15px;margin:15px 0;">
              <p style="margin:0;line-height:1.6;">${body}</p>
            </div>
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
              <p style="color:#666;margin:0;">🚀 L'équipe FunQuiz</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendMailSafe(emailContent);
    return { success: true, message: "Email envoyé" };
  } catch (error) {
    console.error("❌ Erreur mailAdminDirect:", error);
    return { success: false, message: error.message };
  }
};

// Alias rétrocompatible pour les anciens imports (newsletterController)
export const mailMessage = async (email, name, content, subject = "Réponse à votre message") => {
  return mailMessageReply(email, name, content, subject);
};
