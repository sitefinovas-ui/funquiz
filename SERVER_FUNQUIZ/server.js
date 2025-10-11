// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import createError from "http-errors";
import { connectDB } from "./config/db.js"; // ton fichier db.js
import { logger } from "./middleware/logger.js";

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Port fourni par Render ou local
// const IP = process.env.IP; // Render ne fournit pas IP

// Helpers pour chemins en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Middlewares
// -----------------------------
app.use(express.json());
app.use(logger);
app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173", // dev local
        "https://funquiz-two.vercel.app" // front prod Vercel
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Origine non autorisée:", origin);
        callback(new Error("Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// -----------------------------
// Static uploads
// -----------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------
// Middleware global pour BASE_URL
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
      const baseUrl = process.env.BASE_URL || "";
      addBaseUrlRecursively(data, baseUrl);
    } catch (err) {
      console.error("Erreur patch URLs :", err);
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
  (await import("./routes/legalContactRoute.js")).default
);

// Route test API
app.get("/", (req, res) => {
  res.json({ message: "🚀 API FunQuiz fonctionne !" });
});

// -----------------------------
// Middleware 404
// -----------------------------
app.use((req, res, next) => {
  next(createError(404, "Route non trouvée"));
});

// -----------------------------
// Middleware global d'erreur
// -----------------------------
app.use((err, req, res, next) => {
  console.error("Erreur détectée :", err.message);
  res.status(err.status || 500).json({
    status: "error",
    statusCode: err.status || 500,
    message: err.message || "Erreur serveur interne",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// -----------------------------
// Démarrage serveur
// -----------------------------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de connexion à la DB :", error);
    process.exit(1);
  }
};

startServer();
