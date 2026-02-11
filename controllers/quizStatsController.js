import {
  getQuizStats,
  getThematicStats,
  getRecentActivity,
  getUserRankings,
  getDifficultyStats
} from '../models/quizStatsModel.js';

// Récupérer toutes les statistiques des quiz
export const getAllQuizStats = async (req, res) => {
  try {
    console.log('📊 [Controller] Récupération des statistiques quiz');
    
    const [
      globalStats,
      thematicStats,
      recentActivity,
      rankings,
      difficultyStats
    ] = await Promise.all([
      getQuizStats(),
      getThematicStats(),
      getRecentActivity(10),
      getUserRankings(10),
      getDifficultyStats()
    ]);

    console.log('✅ [Controller] Statistiques récupérées avec succès');

    res.status(200).json({
      success: true,
      data: {
        global: globalStats,
        thematics: thematicStats,
        recentActivity,
        rankings,
        difficulty: difficultyStats
      }
    });
  } catch (error) {
    console.error('❌ [Controller] Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des statistiques",
      details: error.message
    });
  }
};

// Récupérer les statistiques globales uniquement
export const getGlobalStats = async (req, res) => {
  try {
    console.log('📊 [Controller] Récupération des statistiques globales');
    const stats = await getQuizStats();
    
    console.log('✅ [Controller] Statistiques globales récupérées');
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ [Controller] Erreur statistiques globales:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des statistiques globales",
      details: error.message
    });
  }
};

// Récupérer les statistiques par thématique
export const getStatsByThematic = async (req, res) => {
  try {
    console.log('📊 [Controller] Récupération des statistiques par thématique');
    const stats = await getThematicStats();
    
    console.log('✅ [Controller] Statistiques par thématique récupérées');
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ [Controller] Erreur statistiques thématiques:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des statistiques par thématique",
      details: error.message
    });
  }
};

// Récupérer l'activité récente
export const getRecentActivityStats = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📊 [Controller] Récupération de l'activité récente (${limit} éléments)`);
    
    const activities = await getRecentActivity(limit);
    console.log('✅ [Controller] Activité récente récupérée');
    
    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('❌ [Controller] Erreur activité récente:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'activité récente",
      details: error.message
    });
  }
};

// Récupérer le classement des utilisateurs
export const getUserRankingsStats = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📊 [Controller] Récupération du classement (${limit} utilisateurs)`);
    
    const rankings = await getUserRankings(limit);
    console.log('✅ [Controller] Classement récupéré');
    
    res.status(200).json({
      success: true,
      data: rankings
    });
  } catch (error) {
    console.error('❌ [Controller] Erreur classement:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du classement",
      details: error.message
    });
  }
};

// Récupérer les statistiques par niveau de difficulté
export const getDifficultyStatistics = async (req, res) => {
  try {
    console.log('📊 [Controller] Récupération des statistiques par difficulté');
    const stats = await getDifficultyStats();
    
    console.log('✅ [Controller] Statistiques par difficulté récupérées');
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ [Controller] Erreur statistiques difficulté:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des statistiques par difficulté",
      details: error.message
    });
  }
};