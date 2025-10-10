import db from "./config/db.js";

async function insertTestData() {
  try {
    // Vérifier si la table est vide
    const [rows] = await db.query('SELECT COUNT(*) as count FROM funquiz_newsletter');
    if (rows[0].count === 0) {
      console.log('Insertion des données de test...');
      
      // Données de test
      const testData = [
        {
          email: 'test1@example.com',
          confirmed: 1,
          user_id: 1
        },
        {
          email: 'test2@example.com',
          confirmed: 0,
          user_id: 2
        },
        {
          email: 'admin@funquiz.com',
          confirmed: 1,
          user_id: null
        }
      ];

      // Insérer les données de test
      for (const data of testData) {
        await db.query(
          'INSERT INTO funquiz_newsletter (email, confirmed, user_id) VALUES (?, ?, ?)',
          [data.email, data.confirmed, data.user_id]
        );
      }

      console.log('Données de test insérées avec succès!');
    } else {
      console.log('La table contient déjà des données.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données de test:', error);
  }
}

// Exécuter l'insertion des données de test
insertTestData();