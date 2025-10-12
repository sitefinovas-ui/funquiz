import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import createError from "http-errors";
import { connectDB } from "./config/db.js";
import { logger } from "./middleware/logger.js";
import compression from "compression";

import authRoutes from "./routes/authRoute.js";
import quizRoutes from "./routes/quizRoute.js";
import faqRoutes from "./routes/faqRoute.js";
import commentRoutes from "./routes/commentRoute.js";
import newsletterRoutes from "./routes/newsletterRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import quizStatsRoutes from "./routes/quizStatsRoute.js";
import quizUserSessionRoutes from "./routes/quizUserSessionRoutes.js";
import logsRoutes from "./routes/logsRoute.js";
import publiciteRoutes from "./routes/publiciteRoute.js";
import { fileURLToPath } from "url";
import path from "path";
import { listPublicites } from "./controllers/publiciteController.js";

// -----------------------------
// Configuration initiale
// -----------------------------
dotenv.config();
const app = express();
const PORT = process.env.PORT ;
const IP = process.env.IP ;

// Helpers pour chemins ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Middleware de performance
// -----------------------------

// Compression Brotli (mieux que gzip)
app.use(compression());

// Caching statique long terme + immutable
app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    maxAge: "365d",
    etag: true,
    immutable: true,
  })
);

// Préchargement de ressources critiques
app.use((req, res, next) => {
  res.setHeader(
    "Link",
    [
      '</public/main.js>; rel=preload; as=script',
      '</public/styles.css>; rel=preload; as=style',
    ].join(", ")
  );
  next();
});

// -----------------------------
// Middleware JSON et sécurité
// -----------------------------
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      message: "Payload JSON invalide",
      details: err.message,
    });
  }
  next(err);
});

// Logger
app.use(logger);

// CORS avec origines autorisées explicites
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🔒 Requête CORS reçue depuis:", origin || "origine non définie");

      const allowedOrigins = [
        "https://funquiz-7k43.onrender.com", // front Render
        "https://funquiz-front.onrender.com",
        "http://localhost:31", // front Vite
        process.env.FRONTEND_URL,             // override via env
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Origine non autorisée:", origin);
        callback(new Error("Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  })
);
// Fallback générique pour les préflights (évite la 404 et le crash path-to-regexp)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});



// -----------------------------
// Middleware : rendre "uploads" public
// -----------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------
// Ajout automatique du BASE_URL sur les champs *_url
// -----------------------------
function addBaseUrlRecursively(obj, baseUrl) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    obj.forEach((item) => addBaseUrlRecursively(item, baseUrl));
    return;
  }
  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "string" && (key === "icon_url" || key.endsWith("_url"))) {
        if (val && !val.startsWith("http")) {
          obj[key] = `${baseUrl}${val}`;
        }
      } else if (typeof val === "object") {
        addBaseUrlRecursively(val, baseUrl);
      }
    }
  }
}

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    try {
      const baseUrl = process.env.BASE_URL;
      addBaseUrlRecursively(data, baseUrl);
    } catch (err) {
      console.error("❌ Erreur lors du patch des URLs :", err);
    }
    return originalJson(data);
  };
  next();
});

// -----------------------------
// Routes principales
// -----------------------------
app.use(
  "/api",
  authRoutes,
  quizRoutes,
  faqRoutes,
  commentRoutes,
  newsletterRoutes,
  messageRoutes,
  quizStatsRoutes,
  quizUserSessionRoutes,
  logsRoutes,
  publiciteRoutes,
  (await import("./routes/legalCguRoute.js")).default,
  (await import("./routes/legalPrivacyRoute.js")).default,
  (await import("./routes/legalCookiesRoute.js")).default,
  (await import("./routes/legalAboutRoute.js")).default,
  (await import("./routes/legalContactRoute.js")).default
);

// Alias de compatibilité pour /publicites (sans /api)
app.get("/publicites", listPublicites);

// -----------------------------
// Route racine de test
// -----------------------------
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API FunQuiz fonctionne !",
    note: "Optimisée avec Brotli, cache statique et préchargement",
  });
});

// -----------------------------
// Gestion des erreurs 404
// -----------------------------
app.use((req, res, next) => {
  next(createError(404, "Route non trouvée"));
});

// -----------------------------
// Middleware global d’erreur
// -----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Erreur détectée :", err.message);

  res.status(err.status || 500).json({
    status: "error",
    statusCode: err.status || 500,
    message: err.message || "Erreur serveur interne",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// -----------------------------
// 🚀 Lancement du serveur
// -----------------------------
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, IP, () => {
      console.log(
        `🚀 Serveur FunQuiz optimisé lancé sur http://${IP === "0.0.0.0" ? "localhost" : IP}:${PORT}/`
      );
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Le port ${PORT} est déjà utilisé.`);
        process.exit(1);
      } else {
        console.error("❌ Erreur serveur :", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données :", error);
    process.exit(1);
  }
};

startServer();
