// db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ✅ Création du pool de connexions MySQL optimisé
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
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
