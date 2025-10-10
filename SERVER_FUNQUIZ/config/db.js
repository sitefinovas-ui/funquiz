import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ✅ Création du pool de connexions MySQL
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

/**
 * Vérifie la connexion à la DB au démarrage
 */
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping(); // test rapide
    connection.release();
    console.log("✅ Connexion MySQL réussie !");
  } catch (error) {
    console.error(
      "❌ Erreur de connexion à la base de données :",
      error.message,
    );
    process.exit(1); // arrête l'app si la DB n'est pas accessible
  }
};

/**
 * Exécute une requête SQL en toute sécurité
 * @param {string} sql - La requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise<object>} - Résultat de la requête
 */
export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Erreur SQL :", error.message);
    throw error;
  }
};

/**
  Ferme toutes les connexions (utile pour les tests ou arrêt propre)
 */
export const closeDB = async () => {
  try {
    await pool.end();
    console.log("🛑 Pool MySQL fermé proprement.");
  } catch (error) {
    console.error(
      "❌ Erreur lors de la fermeture du pool MySQL :",
      error.message,
    );
  }
};

export default pool;
