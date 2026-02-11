import express from "express";
import cors from "cors";
import createError from "http-errors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";

import { connectDB } from "./config/db.js";
import { logger } from "./middleware/logger.js";
import compression from "compression";
import { initializeWhatsApp } from "./utils/whatsapp.js";

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
import privateMessageRoutes from "./routes/privateMessageRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import { fileURLToPath } from "url";
import path from "path";
import { listPublicites } from "./controllers/publiciteController.js";
import { createPrivateMessage, markThreadRead } from "./models/privateMessageModel.js";
import db from "./config/db.js";

const app = express();
const PORT = Number(process.env.PORT) || 5100;
const IP = process.env.IP || "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "votre_clÇ¸_secrÇùte";

const isStaffRole = (role) => role === "admin" || role === "moderator";
const canMessagePair = ({ senderRole, receiverRole }) => {
  const senderStaff = isStaffRole(senderRole);
  const receiverStaff = isStaffRole(receiverRole);
  if (senderStaff && !receiverStaff) return true;
  if (!senderStaff && receiverStaff) return true;
  return false;
};

const getUserRoleById = async (userId) => {
  const [rows] = await db.query(`SELECT role FROM funquiz_users WHERE user_id = ? LIMIT 1`, [
    Number(userId),
  ]);
  return rows?.[0]?.role || null;
};

const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const getAllowedOrigins = () =>
  [
    "https://funquiz2k25.web.app",
    "https://funquiz2k25.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:31",
    ...parseOrigins(process.env.FRONTEND_URL),
    ...parseOrigins(process.env.FRONTEND_URLS),
  ].filter(Boolean);

const isOriginAllowed = (origin) => {
  const allowedOrigins = getAllowedOrigins();
  const allowLan = origin && origin.startsWith("http://192.168.");
  return !origin || allowedOrigins.includes(origin) || allowLan;
};

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

      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Origine non autorisée:", origin);
        callback(new Error("Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  })
);

// Fallback préflight OPTIONS (sans wildcard Express 5)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(204);
  }
  next();
});


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
  privateMessageRoutes,
  quizStatsRoutes,
  quizUserSessionRoutes,
  logsRoutes,
  publiciteRoutes,
  adminRoutes,
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
// Lancement du serveur
// -----------------------------
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("[startup] Database connection failed:", error);
    process.exit(1);
  }

  try {
    await initializeWhatsApp();
  } catch (error) {
    console.error("[startup] WhatsApp init failed, server will continue:", error?.message || error);
  }

  try {
    const httpServer = http.createServer(app);
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          if (isOriginAllowed(origin)) return callback(null, true);
          return callback(new Error("Origin not allowed"));
        },
        credentials: true,
      },
    });

    io.use((socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          (socket.handshake.headers?.authorization || "").split(" ")[1];
        if (!token) return next(new Error("Token manquant"));
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded?.user_id) return next(new Error("Token invalide"));
        socket.user = decoded;
        return next();
      } catch (err) {
        return next(new Error("Token invalide"));
      }
    });

    io.on("connection", (socket) => {
      const userId = socket.user?.user_id;
      if (userId) socket.join(`user:${userId}`);

      socket.on("private:send", async (payload) => {
        try {
          const receiver_id = Number(payload?.toUserId);
          const content = String(payload?.content || "").trim();
          if (!receiver_id || !content) return;

          const senderRole = socket.user?.role || "user";
          const receiverRole = await getUserRoleById(receiver_id);
          if (!receiverRole) return;
          if (!canMessagePair({ senderRole, receiverRole })) return;

          const saved = await createPrivateMessage({
            sender_id: userId,
            receiver_id,
            content,
          });

          io.to(`user:${receiver_id}`).emit("private:message", saved);
          io.to(`user:${userId}`).emit("private:message", saved);
        } catch (err) {
          console.error("Socket private:send error:", err.message);
        }
      });

      socket.on("private:read", async (payload) => {
        try {
          const other_id = Number(payload?.other_id);
          if (!other_id) return;

          const myRole = socket.user?.role || "user";
          const otherRole = await getUserRoleById(other_id);
          if (!otherRole) return;
          if (!canMessagePair({ senderRole: myRole, receiverRole: otherRole })) return;

          await markThreadRead(userId, other_id);
          io.to(`user:${other_id}`).emit("private:read", { by: userId });
        } catch (err) {
          console.error("Socket private:read error:", err.message);
        }
      });
    });

    app.set("io", io);

    const listenOn = (host) => {
      httpServer.listen(PORT, host, () => {
        console.log(
          `Server FunQuiz running on http://${host === "0.0.0.0" ? "localhost" : host}:${PORT}/`
        );
      });
    };

    listenOn(IP);

    httpServer.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} already in use.`);
        process.exit(1);
      } else if (error.code === "EADDRNOTAVAIL") {
        const fallbackHost = "0.0.0.0";
        console.error(`Address ${IP} not available, falling back to ${fallbackHost}`);
        try {
          httpServer.close(() => listenOn(fallbackHost));
        } catch {
          listenOn(fallbackHost);
        }
      } else {
        console.error("Server error:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("[startup] Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
