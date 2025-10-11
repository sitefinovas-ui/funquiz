import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import createError from "http-errors";
import { connectDB } from "./config/db.js";
import { logger } from "./middleware/logger.js";

import authRoutes from "./routes/authRoute.js";
import quizRoutes from "./routes/quizRoute.js";
import faqRoutes from "./routes/faqRoute.js";
import commentRoutes from "./routes/commentRoute.js";
import newsletterRoutes from "./routes/newsletterRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import quizStatsRoutes from "./routes/quizStatsRoute.js";
import quizUserSessionRoutes from "./routes/quizUserSessionRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
import logsRoutes from "./routes/logsRoute.js";
import publiciteRoutes from "./routes/publiciteRoute.js";
//complet
dotenv.config();

const app = express();
const PORT = process.env.PORT ;
const IP = process.env.IP ;

// Helpers pour chemins en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware JSON
app.use(express.json());
app.use(logger);
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🔒 Requête CORS reçue depuis:', origin);

      const allowedOrigins = [
        "https://funquiz-front.onrender.com", 
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('❌ Origine non autorisée:', origin);
        callback(new Error('Origin not allowed'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// -----------------------------
// Middleware : rendre "uploads" public
// -----------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------
// Middleware global : ajouter BASE_URL aux *_url
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
      if (
        typeof val === "string" &&
        (key === "icon_url" || key.endsWith("_url"))
      ) {
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
// Routes
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
  (await import("./routes/legalContactRoute.js")).default,
);

// Route test API
app.get("/", (req, res) => {
  res.json({ message: "🚀 API FunQuiz fonctionne !" });
});

// -----------------------------
// Middleware pour gérer les 404
// -----------------------------
app.use((req, res, next) => {
  next(createError(404, "Route non trouvée"));
});

// -----------------------------
// Middleware global d'erreur
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

// 🚀 Lancement serveur
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, IP, () => {
      console.log(
        `🚀 Serveur lancé sur http://${IP === "0.0.0.0" ? "localhost" : IP}:${PORT}/`,
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
