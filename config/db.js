// db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

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

const dbHost = stripWrappingQuotes(process.env.DB_HOST || "127.0.0.1");
const dbUser = stripWrappingQuotes(process.env.DB_USER || "root");
const dbPasswordRaw = stripWrappingQuotes(process.env.DB_PASSWORD || "");
const dbPassword = dbPasswordRaw && dbPasswordRaw.trim().length > 0 ? dbPasswordRaw : "root";
const dbName = stripWrappingQuotes(process.env.DB_NAME || "funquiz");
const dbPort = Number(stripWrappingQuotes(process.env.DB_PORT || "")) || 3306;

// ✅ Création du pool de connexions MySQL optimisé
const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 50, // Augmenté pour supporter plus d'utilisateurs
  queueLimit: 0, // illimité
  connectTimeout: 10000, // 10 secondes
});

// 🌟 Vérifie la connexion à la DB au démarrage
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping(); // test rapide
    connection.release();
    console.log("✅ Connexion MySQL réussie !");

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS funquiz_newsletter (
          newsletter_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          user_id INT DEFAULT NULL,
          email VARCHAR(255) NOT NULL,
          subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          confirmed TINYINT(1) NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (newsletter_id),
          UNIQUE KEY uq_email (email),
          KEY idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("❌ Erreur lors de la création de funquiz_newsletter :", e.message);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS funquiz_messages (
          message_id INT NOT NULL AUTO_INCREMENT,
          admin_id INT DEFAULT NULL,
          content_admin TEXT,
          user_id INT DEFAULT NULL,
          name VARCHAR(100) DEFAULT NULL,
          email VARCHAR(150) DEFAULT NULL,
          subject VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
          status ENUM('unread','read','in_progress','resolved','closed') DEFAULT 'unread',
          assigned_to INT DEFAULT NULL,
          created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (message_id),
          KEY idx_user_id (user_id),
          KEY idx_email (email),
          KEY idx_status (status),
          KEY idx_priority (priority),
          KEY idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("❌ Erreur lors de la création de funquiz_messages :", e.message);
    }

    // Compatibilité: certains dumps ont message_id sans AUTO_INCREMENT / sans PK
    try {
      await pool.query(`ALTER TABLE funquiz_messages ADD PRIMARY KEY (message_id)`);
    } catch (e) {
      // ignore si déjà présent ou si données invalides
    }
    try {
      await pool.query(`ALTER TABLE funquiz_messages MODIFY message_id INT NOT NULL AUTO_INCREMENT`);
    } catch (e) {
      // ignore si déjà en place
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS publicite (
          id INT NOT NULL AUTO_INCREMENT,
          titre VARCHAR(255) NOT NULL,
          description TEXT,
          image_url VARCHAR(500) DEFAULT NULL,
          date_debut DATE DEFAULT NULL,
          date_fin DATE DEFAULT NULL,
          statut ENUM('actif','inactif','expiré') DEFAULT 'inactif',
          type ENUM('image','popup','banniere') DEFAULT 'image',
          clics INT DEFAULT 0,
          created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("❌ Erreur lors de la création de publicite :", e.message);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS funquiz_comments (
          comment_id INT NOT NULL AUTO_INCREMENT,
          user_id INT NOT NULL,
          parent_comment_id INT DEFAULT NULL,
          content TEXT NOT NULL,
          is_approved TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          is_visible TINYINT(1) NOT NULL DEFAULT 0,
          PRIMARY KEY (comment_id),
          KEY idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("❌ Erreur lors de la création de funquiz_comments :", e.message);
    }

    try {
      await pool.query(`ALTER TABLE funquiz_comments ADD PRIMARY KEY (comment_id)`);
    } catch (e) {
      // ignore si déjà présent
    }
    try {
      await pool.query(`ALTER TABLE funquiz_comments MODIFY comment_id INT NOT NULL AUTO_INCREMENT`);
    } catch (e) {
      // ignore si déjà en place
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS funquiz_private_messages (
          message_id INT NOT NULL AUTO_INCREMENT,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL DEFAULT NULL,
          PRIMARY KEY (message_id),
          KEY idx_sender (sender_id),
          KEY idx_receiver (receiver_id),
          KEY idx_pair (sender_id, receiver_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("Erreur lors de la creation de funquiz_private_messages :", e.message);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_feedbacks (
          id INT NOT NULL AUTO_INCREMENT,
          user_id INT NOT NULL,
          reason VARCHAR(255) NOT NULL,
          comment TEXT,
          created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("Erreur lors de la creation de user_feedbacks :", e.message);
    }

  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données :", error.message);
    process.exit(1); // arrête l'app si la DB n'est pas accessible
  }
};

// 🌟 Exécute une requête SQL en toute sécurité avec retry automatique
export const query = async (sql, params = [], retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error(`❌ Erreur SQL (tentative ${attempt}) :`, error.message);
      if (attempt === retries) throw error;
      await new Promise(res => setTimeout(res, 500)); // attente 500ms avant retry
    }
  }
};

// 🌟 Ferme toutes les connexions (utile pour tests ou arrêt propre)
export const closeDB = async () => {
  try {
    await pool.end();
    console.log("🛑 Pool MySQL fermé proprement.");
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture du pool MySQL :", error.message);
  }
};

export default pool;
