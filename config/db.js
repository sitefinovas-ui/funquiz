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

    // 🛠️ Migrations robustes pour les tables existantes
    const tablesToFix = [
      { name: "about", id: "id" },
      { name: "cgu", id: "id" },
      { name: "contact", id: "id" },
      { name: "cookies_policy", id: "id" },
      { name: "privacy_policy", id: "id" },
      { name: "countries", id: "id" },
      { name: "funquiz_faq", id: "faq_id" },
      { name: "funquiz_comments", id: "comment_id" },
      { name: "funquiz_users", id: "user_id" },
      { name: "quiz_thematics", id: "thematic_id" },
      { name: "quiz_sub_thematics", id: "sub_thematic_id" },
      { name: "quiz_questions", id: "question_id" },
      { name: "quiz_answers", id: "answer_id" }
    ];

    for (const table of tablesToFix) {
      try {
        // 1. Assurer la PK
        await pool.query(`ALTER TABLE ${table.name} ADD PRIMARY KEY (${table.id})`);
      } catch (e) { /* ignore si déjà PK */ }
      
      try {
        // 2. Assurer l'AUTO_INCREMENT
        await pool.query(`ALTER TABLE ${table.name} MODIFY COLUMN ${table.id} INT(11) NOT NULL AUTO_INCREMENT`);
      } catch (e) { /* ignore */ }
    }

    // Migration spécifique pour 'about' : ajout de la colonne 'status'
    try {
      await pool.query(`ALTER TABLE about ADD COLUMN status ENUM('draft', 'published') DEFAULT 'published' AFTER contact_email`);
    } catch (e) {
      // ignore si déjà présent
    }

    // Migration pour la table 'funquiz_users' : ajout de la colonne 'preferences'
    try {
      await pool.query(`ALTER TABLE funquiz_users ADD COLUMN preferences JSON DEFAULT NULL AFTER role`);
    } catch (e) {
      // ignore si déjà présent
    }

    // Migration pour la table 'funquiz_role_permissions'
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS funquiz_role_permissions (
          role ENUM('admin', 'moderator', 'user') PRIMARY KEY,
          permissions JSON NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      // Valeurs par défaut
      await pool.query(`INSERT IGNORE INTO funquiz_role_permissions (role, permissions) VALUES 
        ('admin', '{"users_view": true, "users_edit": true, "users_delete": true, "comments_view": true, "comments_approve": true, "comments_delete": true, "quiz_view": true, "quiz_edit": true, "quiz_delete": true, "settings_view": true, "settings_edit": true, "about_edit": true, "logs_view": true}'),
        ('moderator', '{"users_view": true, "users_edit": false, "users_delete": false, "comments_view": true, "comments_approve": true, "comments_delete": true, "quiz_view": true, "quiz_edit": true, "quiz_delete": false, "settings_view": false, "settings_edit": false, "about_edit": false, "logs_view": false}'),
        ('user', '{"users_view": false, "users_edit": false, "users_delete": false, "comments_view": false, "comments_approve": false, "comments_delete": false, "quiz_view": false, "quiz_edit": false, "quiz_delete": false, "settings_view": false, "settings_edit": false, "about_edit": false, "logs_view": false}')
      `);
    } catch (e) {
      console.error("Erreur migration role_permissions:", e);
    }

    // Migration pour la table 'moderator_actions'
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS moderator_actions (
          action_id INT AUTO_INCREMENT PRIMARY KEY,
          moderator_id INT NOT NULL,
          action_type VARCHAR(50) NOT NULL,
          target_type VARCHAR(50) NOT NULL,
          target_id VARCHAR(255) DEFAULT NULL,
          details TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (moderator_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("Erreur migration moderator_actions:", e);
    }

    // Migration pour la table 'funquiz_settings'
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS funquiz_settings (
          setting_key VARCHAR(255) PRIMARY KEY,
          setting_value TEXT DEFAULT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      // Valeurs par défaut
      await pool.query(`INSERT IGNORE INTO funquiz_settings (setting_key, setting_value) VALUES 
        ('MAIL_PROVIDER', 'smtp'),
        ('RESEND_API_KEY', ''),
        ('SMTP_HOST', ''),
        ('SMTP_PORT', '587'),
        ('SMTP_USER', ''),
        ('SMTP_PASS', ''),
        ('SMTP_SECURE', 'false'),
        ('MAIL_FROM', 'FunQuiz <no-reply@funquiz.com>')
      `);
    } catch (e) {
      console.error("Erreur migration settings:", e);
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

    // ---------------------------------------------------------------------
    // Quiz: compatibilité dumps (AUTO_INCREMENT manquants)
    // ---------------------------------------------------------------------

    // Historique des parties (sert au calcul des points)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_game_history (
          history_id INT NOT NULL AUTO_INCREMENT,
          user_id INT NOT NULL,
          sub_thematic_id INT DEFAULT NULL,
          score INT DEFAULT 0,
          max_score INT NOT NULL,
          total_questions INT NOT NULL,
          correct_answers INT DEFAULT 0,
          time_spent INT DEFAULT NULL,
          difficulty_level ENUM('facile','moyen','difficile') DEFAULT NULL,
          completion_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
            (CASE
              WHEN (total_questions > 0) THEN ((correct_answers * 100.0) / total_questions)
              ELSE 0
            END)
          ) STORED,
          played_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (history_id),
          KEY idx_user_id (user_id),
          KEY idx_played_at (played_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("❌ Erreur lors de la création de quiz_game_history :", e.message);
    }

    // Certains dumps ont history_id sans AUTO_INCREMENT / sans PK
    try {
      await pool.query(`ALTER TABLE quiz_game_history ADD PRIMARY KEY (history_id)`);
    } catch (e) {
      // ignore si déjà présent
    }
    try {
      await pool.query(`ALTER TABLE quiz_game_history MODIFY history_id INT NOT NULL AUTO_INCREMENT`);
    } catch (e) {
      // ignore si déjà en place
    }

    // Sessions utilisateur (jeu / reprise)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_user_sessions (
          session_id INT NOT NULL AUTO_INCREMENT,
          user_id INT NOT NULL,
          thematic_id INT NOT NULL,
          sub_thematic_id INT DEFAULT NULL,
          current_question_index INT DEFAULT 0,
          answered_questions JSON DEFAULT NULL,
          current_score INT DEFAULT 0,
          correct_answers_count INT DEFAULT 0,
          total_questions INT NOT NULL,
          difficulty_level ENUM('facile','moyen','difficile') DEFAULT NULL,
          time_started TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          last_activity TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          is_completed TINYINT(1) DEFAULT 0,
          session_data JSON DEFAULT NULL,
          PRIMARY KEY (session_id),
          KEY idx_user_id (user_id),
          KEY idx_last_activity (last_activity)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error("❌ Erreur lors de la création de quiz_user_sessions :", e.message);
    }

    // Certains dumps ont session_id sans AUTO_INCREMENT / sans PK
    try {
      await pool.query(`ALTER TABLE quiz_user_sessions ADD PRIMARY KEY (session_id)`);
    } catch (e) {
      // ignore si déjà présent
    }
    try {
      await pool.query(`ALTER TABLE quiz_user_sessions MODIFY session_id INT NOT NULL AUTO_INCREMENT`);
    } catch (e) {
      // ignore si déjà en place
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
