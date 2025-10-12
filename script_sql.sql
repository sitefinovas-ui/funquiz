-- =========================================================
-- 🎮 BASE DE DONNÉES FUNQUIZ - CÔTE D'IVOIRE
-- =========================================================
-- Version: 2.1 - Structure sans données
-- Date: 2025-09-26
-- =========================================================

-- CRÉATION BASE
DROP DATABASE IF EXISTS funquiz;
CREATE DATABASE funquiz CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE funquiz;

-- =========================================================
-- 👤 TABLE UTILISATEURS
-- =========================================================
CREATE TABLE funquiz_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    number VARCHAR(10) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    role ENUM('user','admin','moderator') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_number (number),
    INDEX idx_role (role)
);

-- =========================================================
-- 🏷️ TABLE THÉMATIQUES
-- =========================================================
CREATE TABLE quiz_thematics (
    thematic_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    color_code VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_order (is_active, display_order)
);

-- =========================================================
-- 🏷️ TABLE SOUS-THÉMATIQUES
-- =========================================================
CREATE TABLE quiz_sub_thematics (
    sub_thematic_id INT AUTO_INCREMENT PRIMARY KEY,
    thematic_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level ENUM('facile','moyen','difficile') DEFAULT 'moyen',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (thematic_id) REFERENCES quiz_thematics(thematic_id) ON DELETE CASCADE,
    INDEX idx_thematic (thematic_id),
    INDEX idx_difficulty (difficulty_level)
);

-- =========================================================
-- ❓ TABLE QUESTIONS
-- =========================================================
CREATE TABLE quiz_questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    sub_thematic_id INT NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT,
    difficulty_level ENUM('facile','moyen','difficile') DEFAULT 'moyen',
    question_type ENUM('multiple_choice','single_choice','true_false','text_input') DEFAULT 'multiple_choice',
    points INT DEFAULT 10,
    time_limit INT DEFAULT 30,
    allow_multiple_correct BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sub_thematic_id) REFERENCES quiz_sub_thematics(sub_thematic_id) ON DELETE CASCADE,
    INDEX idx_sub_thematic (sub_thematic_id),
    INDEX idx_type (question_type),
    INDEX idx_active (is_active)
);

-- =========================================================
-- ✅ TABLE RÉPONSES
-- =========================================================
CREATE TABLE quiz_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    content TEXT NOT NULL,
    answer_type ENUM('text','image','audio','video') DEFAULT 'text',
    media_url VARCHAR(500),
    is_correct BOOLEAN DEFAULT FALSE,
    points_value INT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
    INDEX idx_question (question_id),
    INDEX idx_correct (is_correct)
);

-- =========================================================
-- 💬 TABLE COMMENTAIRES
-- =========================================================
CREATE TABLE funquiz_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    parent_comment_id INT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES funquiz_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES funquiz_comments(comment_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_approved (is_approved)
);

-- =========================================================
-- 📬 TABLE MESSAGES (CONTACT)
-- =========================================================
CREATE TABLE funquiz_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100),
    email VARCHAR(150),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
    status ENUM('unread','read','in_progress','resolved','closed') DEFAULT 'unread',
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES funquiz_users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES funquiz_users(user_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- =========================================================
-- 🎯 TABLE HISTORIQUE DES JEUX
-- =========================================================
CREATE TABLE quiz_game_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sub_thematic_id INT,
    score INT DEFAULT 0,
    max_score INT NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    time_spent INT,
    difficulty_level ENUM('facile','moyen','difficile'),
    completion_percentage DECIMAL(5,2) AS (
        CASE 
            WHEN total_questions > 0 THEN (correct_answers * 100.0 / total_questions)
            ELSE 0 
        END
    ) STORED,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES funquiz_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sub_thematic_id) REFERENCES quiz_sub_thematics(sub_thematic_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_score (score),
    INDEX idx_played_at (played_at)
);

-- =========================================================
-- 🏆 TABLE ACHIEVEMENTS
-- =========================================================
CREATE TABLE achievements (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    badge_color VARCHAR(7) DEFAULT '#ffd700',
    condition_type ENUM('score','games_played','streak','perfect_score','time_spent') NOT NULL,
    condition_value INT NOT NULL,
    points_reward INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_condition (condition_type),
    INDEX idx_active (is_active)
);

-- =========================================================
-- 🏅 TABLE ACHIEVEMENTS UTILISATEURS
-- =========================================================
CREATE TABLE quiz_user_achievements (
    user_achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES funquiz_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_achievement (achievement_id)
);

-- =========================================================
-- 📊 VUES STATISTIQUES
-- =========================================================
CREATE VIEW user_points AS
SELECT 
    u.user_id,
    u.name,
    u.first_name,
    CONCAT(u.first_name, ' ', u.name) as full_name,
    u.email,
    COALESCE(SUM(gh.score), 0) AS total_points_games,
    COALESCE(SUM(a.points_reward), 0) AS total_points_achievements,
    COALESCE(SUM(gh.score), 0) + COALESCE(SUM(a.points_reward), 0) AS total_points,
    COUNT(DISTINCT gh.history_id) as total_games_played,
    COUNT(DISTINCT ua.achievement_id) as total_achievements,
    COALESCE(AVG(gh.completion_percentage), 0) as average_completion
FROM funquiz_users u
LEFT JOIN quiz_game_history gh ON u.user_id = gh.user_id
LEFT JOIN quiz_user_achievements ua ON u.user_id = ua.user_id
LEFT JOIN achievements a ON ua.achievement_id = a.achievement_id
WHERE u.is_active = TRUE
GROUP BY u.user_id, u.name, u.first_name, u.email;

-- ✅ 1. Table : Conditions Générales d’Utilisation (CGU)
CREATE TABLE IF NOT EXISTS cgu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('draft', 'published') DEFAULT 'draft'
);

-- ✅ 2. Table : Politique de confidentialité
CREATE TABLE IF NOT EXISTS privacy_policy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('draft', 'published') DEFAULT 'draft'
);

-- ✅ 3. Table : Politique des cookies
CREATE TABLE IF NOT EXISTS cookies_policy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('draft', 'published') DEFAULT 'draft'
);

-- ✅ 4. Table : À propos (About)
CREATE TABLE IF NOT EXISTS about (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  mission TEXT,
  vision TEXT,
  contact_email VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- ✅ 5. Table : Formulaire de contact (Contact)

#	Nom	Type	Interclassement	Attributs	Null	Valeur par défaut	Commentaires	Extra	Action
	1	id  Primaire	int			Non	Aucun(e)		AUTO_INCREMENT	 Modifier Modifier	 Supprimer Supprimer	
 	2	service	varchar(100)	utf8mb4_general_ci		Non	Aucun(e)			 Modifier Modifier	 Supprimer Supprimer	
 	3	email	varchar(150)	utf8mb4_general_ci		Non	Aucun(e)			 Modifier Modifier	 Supprimer Supprimer	
 	4	content	text	utf8mb4_general_ci		Non	Aucun(e)			 Modifier Modifier	 Supprimer Supprimer	
 	5	created_at	datetime			Oui	CURRENT_TIMESTAMP		DEFAULT_GENERATED	 Modifier Modifier	 Supprimer Supprimer	
 	6	status	enum('operationnel', 'cacher')	utf8mb4_general_ci
-- =========================================================
-- 📢 TABLE PUBLICITÉ
-- =========================================================
CREATE TABLE funquiz_publicite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    date_debut DATE,
    date_fin DATE,
    statut ENUM('actif', 'inactif', 'expiré') DEFAULT 'inactif',
    type ENUM('image', 'popup', 'banniere') DEFAULT 'image',
    clics INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
