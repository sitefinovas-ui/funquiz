-- =========================================================
-- 🎮 BASE DE DONNÉES FUNQUIZ - CÔTE D'IVOIRE
-- =========================================================
-- Version: 2.0 - Contexte 100% Ivoirien
-- Date: 2025-09-25
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

-- =========================================================
-- 🎮 DONNÉES - UTILISATEURS IVOIRIENS
-- =========================================================
INSERT INTO funquiz_users (name, first_name, email, number, password_hash, role) VALUES
('Kouadio', 'Jean-Baptiste', 'jb.kouadio@example.ci', '0102030405', '$2y$10$hash_jean_baptiste', 'admin'),
('Traoré', 'Awa Fatou', 'awa.traore@example.ci', '0102030406', '$2y$10$hash_awa', 'user'),
('Koné', 'Moussa', 'moussa.kone@example.ci', '0102030407', '$2y$10$hash_moussa', 'moderator'),
('Ouattara', 'Aminata', 'aminata.ouattara@example.ci', '0102030408', '$2y$10$hash_aminata', 'user'),
('Bamba', 'Seydou', 'seydou.bamba@example.ci', '0102030409', '$2y$10$hash_seydou', 'user'),
('Diabaté', 'Mariam', 'mariam.diabate@example.ci', '0102030410', '$2y$10$hash_mariam', 'user'),
('Yao', 'Christian', 'christian.yao@example.ci', '0102030411', '$2y$10$hash_christian', 'user'),
('N\'Guessan', 'Adjoua', 'adjoua.nguessan@example.ci', '0102030412', '$2y$10$hash_adjoua', 'user'),
('Sangaré', 'Ibrahim', 'ibrahim.sangare@example.ci', '0102030413', '$2y$10$hash_ibrahim', 'user'),
('Kouamé', 'Akissi', 'akissi.kouame@example.ci', '0102030414', '$2y$10$hash_akissi', 'user');

-- Utilisateur avec Google Auth
UPDATE funquiz_users SET google_id = '1234567890abcdef' WHERE email = 'seydou.bamba@example.ci';

-- =========================================================
-- 🎶 THÉMATIQUES IVOIRIENNES
-- =========================================================
INSERT INTO quiz_thematics (title, description, icon_url, color_code, display_order) VALUES
('Musique', 'Musique ivoirienne : Coupé-décalé, Zouglou, Reggae et artistes locaux', '🎵', '#f97316', 1),
('Gastronomie', 'Spécialités culinaires : Attiéké, Foutou, Kedjenou et saveurs ivoiriennes', '🍽️', '#10b981', 2),
('Sport', 'Football, athlétisme et champions ivoiriens sur la scène internationale', '⚽', '#ef4444', 3),
('Langue', 'Français ivoirien, langues nationales et expressions populaires', '🗣️', '#3b82f6', 4),
('Culture', 'Traditions, masques, fêtes et patrimoine culturel ivoirien', '🎭', '#8b5cf6', 5),
('Vie quotidienne', 'Transport, marchés, coutumes et réalités du quotidien ivoirien', '🏠', '#06b6d4', 6);

-- =========================================================
-- 📚 SOUS-THÉMATIQUES DÉTAILLÉES
-- =========================================================
INSERT INTO quiz_sub_thematics (thematic_id, title, description, difficulty_level, display_order) VALUES
-- MUSIQUE (thematic_id = 1)
(1, 'Coupé-Décalé', 'Le mouvement musical né dans la diaspora ivoirienne', 'facile', 1),
(1, 'Zouglou', 'Musique universitaire et contestataire des années 90', 'moyen', 2),
(1, 'Reggae ivoirien', 'Alpha Blondy et la scène reggae locale', 'facile', 3),
(1, 'Musique traditionnelle', 'Instruments et rythmes ancestraux des ethnies', 'difficile', 4),
(1, 'Variétés modernes', 'Pop, R&B et nouvelles tendances musicales', 'facile', 5),

-- GASTRONOMIE (thematic_id = 2)
(2, 'Plats principaux', 'Attiéké, Foutou, Kedjenou et spécialités régionales', 'facile', 1),
(2, 'Ingrédients locaux', 'Produits du terroir et épices traditionnels', 'moyen', 2),
(2, 'Boissons traditionnelles', 'Bangui, Bissap, jus locaux et rafraîchissements', 'facile', 3),
(2, 'Snacks et encas', 'Garba, Alloco, Beignets et petites collations', 'facile', 4),
(2, 'Cuisine de fête', 'Mets préparés lors des grandes occasions', 'moyen', 5),

-- SPORT (thematic_id = 3)
(3, 'Football national', 'Les Éléphants de Côte d\'Ivoire et leurs exploits', 'facile', 1),
(3, 'Championnat local', 'Ligue 1 ivoirienne et clubs emblématiques', 'moyen', 2),
(3, 'Athlétisme', 'Champions ivoiriens en course et disciplines', 'moyen', 3),
(3, 'Sports traditionnels', 'Lutte, jeux ancestraux et sports locaux', 'difficile', 4),
(3, 'Infrastructures', 'Stades, complexes sportifs du pays', 'moyen', 5),

-- LANGUE (thematic_id = 4)
(4, 'Français ivoirien', 'Particularités et spécificités du français local', 'facile', 1),
(4, 'Langues nationales', 'Baoulé, Dioula, Bété, Sénoufo et autres', 'moyen', 2),
(4, 'Expressions populaires', 'Argot, Nouchi et langage de la rue', 'facile', 3),
(4, 'Proverbes traditionnels', 'Sagesse ancestrale et dictons populaires', 'difficile', 4),
(4, 'Littérature ivoirienne', 'Auteurs célèbres et œuvres emblématiques', 'difficile', 5),

-- CULTURE (thematic_id = 5)
(5, 'Fêtes traditionnelles', 'Cérémonies, rituels et célébrations ancestrales', 'moyen', 1),
(5, 'Masques et art', 'Sculptures, masques Dan, Baoulé et artisanat', 'difficile', 2),
(5, 'Danses traditionnelles', 'Rythmes et chorégraphies des différentes ethnies', 'moyen', 3),
(5, 'Cinéma ivoirien', 'Réalisateurs, acteurs et productions locales', 'moyen', 4),
(5, 'Patrimoine historique', 'Sites, monuments et lieux emblématiques', 'difficile', 5),

-- VIE QUOTIDIENNE (thematic_id = 6)
(6, 'Transport urbain', 'Gbaka, Wôrô-wôrô et moyens de déplacement', 'facile', 1),
(6, 'Marchés et commerce', 'Grands marchés, commerce et vie économique', 'facile', 2),
(6, 'Habitat et architecture', 'Types de logements et constructions locales', 'moyen', 3),
(6, 'Coutumes sociales', 'Savoir-vivre, politesse et traditions sociales', 'moyen', 4),
(6, 'Éducation et jeunesse', 'Système scolaire et vie des jeunes', 'moyen', 5);

-- =========================================================
-- ❓ QUESTIONS COMPLÈTES - CONTEXTE IVOIRIEN
-- =========================================================
INSERT INTO quiz_questions (sub_thematic_id, content, explanation, difficulty_level, question_type, points, time_limit, allow_multiple_correct) VALUES
-- COUPÉ-DÉCALÉ (sub_thematic_id = 1)
(1, 'Qui est considéré comme le créateur du Coupé-Décalé ?', 'DJ Arafat (Ange Didier Houon) et la Jet Set ont popularisé ce mouvement musical dans les années 2000', 'facile', 'single_choice', 10, 25, FALSE),
(1, 'Dans quelle ville le Coupé-Décalé est-il né ?', 'Ce genre musical est né à Paris dans la diaspora ivoirienne avant de conquérir la Côte d\'Ivoire', 'moyen', 'single_choice', 15, 30, FALSE),
(1, 'Que signifie "Coupé-Décalé" ?', 'Expression qui évoque le fait de "couper" et de "décaler", de se démarquer', 'facile', 'single_choice', 10, 25, FALSE),

-- ZOUGLOU (sub_thematic_id = 2)
(2, 'Le Zouglou est né dans quel contexte ?', 'Musique de protestation née dans les résidences universitaires dans les années 90', 'moyen', 'single_choice', 15, 35, FALSE),
(2, 'Quel groupe a popularisé le Zouglou ?', 'Magic System est l\'un des groupes emblématiques de ce genre', 'facile', 'single_choice', 10, 25, FALSE),

-- REGGAE IVOIRIEN (sub_thematic_id = 3)
(3, 'Quel artiste ivoirien est surnommé le "Reggae Man d\'Afrique" ?', 'Alpha Blondy est la figure emblématique du reggae africain', 'facile', 'single_choice', 10, 20, FALSE),
(3, 'Quel est le vrai nom d\'Alpha Blondy ?', 'Nom de naissance de cette légende du reggae ivoirien', 'moyen', 'single_choice', 15, 30, FALSE),

-- PLATS PRINCIPAUX (sub_thematic_id = 6)
(6, 'L\'attiéké est fait à base de quel ingrédient principal ?', 'Semoule de manioc fermenté, spécialité des peuples lagunaires', 'facile', 'single_choice', 5, 20, FALSE),
(6, 'Que signifie "Kedjenou" ?', 'Plat traditionnel cuit en vase clos sans ajout d\'eau', 'facile', 'single_choice', 10, 25, FALSE),
(6, 'Le Foutou est composé de quels ingrédients ? (Plusieurs réponses possibles)', 'Plat à base de tubercules pilés', 'moyen', 'multiple_choice', 15, 40, TRUE),
(6, 'Quel poisson accompagne traditionnellement l\'attiéké ?', 'Poisson grillé typique des plats lagunaires', 'moyen', 'single_choice', 10, 25, FALSE),

-- SNACKS ET ENCAS (sub_thematic_id = 9)
(9, 'Le "Garba" est composé de quoi ?', 'Plat populaire des étudiants et jeunes travailleurs', 'facile', 'single_choice', 5, 20, FALSE),
(9, 'Comment appelle-t-on les bananes frites en Côte d\'Ivoire ?', 'Accompagnement très populaire dans la cuisine ivoirienne', 'facile', 'single_choice', 5, 18, FALSE),

-- FOOTBALL NATIONAL (sub_thematic_id = 11)
(11, 'Combien de Coupes d\'Afrique des Nations la Côte d\'Ivoire a-t-elle remportées ?', 'Les Éléphants ont été sacrés champions d\'Afrique', 'moyen', 'single_choice', 15, 30, FALSE),
(11, 'En quelle année la Côte d\'Ivoire a-t-elle remporté sa première CAN ?', 'Première victoire historique des Éléphants', 'moyen', 'single_choice', 15, 30, FALSE),
(11, 'Quel joueur ivoirien est devenu une légende à Chelsea ?', 'Buteur emblématique des Éléphants', 'facile', 'single_choice', 10, 25, FALSE),

-- FRANÇAIS IVOIRIEN (sub_thematic_id = 16)
(16, 'Que signifie l\'expression "On dit quoi ?" en Côte d\'Ivoire ?', 'Salutation très populaire chez les jeunes ivoiriens', 'facile', 'single_choice', 5, 20, FALSE),
(16, 'Que veut dire "Yako" ?', 'Expression de compassion très utilisée', 'facile', 'single_choice', 5, 15, FALSE),
(16, '"Dêh" est une interjection qui exprime quoi ?', 'Exclamation typiquement ivoirienne', 'facile', 'single_choice', 5, 15, FALSE),

-- LANGUES NATIONALES (sub_thematic_id = 17)
(17, 'Le Dioula est principalement parlé dans quelle région ?', 'Langue véhiculaire du nord de la Côte d\'Ivoire', 'moyen', 'single_choice', 10, 25, FALSE),
(17, 'Quelle est la langue majoritaire dans la région du centre ?', 'Langue parlée dans la région de Bouaké', 'moyen', 'single_choice', 10, 25, FALSE),

-- TRANSPORT URBAIN (sub_thematic_id = 26)
(26, 'Qu\'est-ce qu\'un "Gbaka" ?', 'Moyen de transport très populaire à Abidjan', 'facile', 'single_choice', 5, 20, FALSE),
(26, 'Comment appelle-t-on les taxis collectifs en brousse ?', 'Transport interurbain en Côte d\'Ivoire', 'facile', 'single_choice', 5, 18, FALSE),

-- MARCHÉS ET COMMERCE (sub_thematic_id = 27)
(27, 'Quel est le plus grand marché d\'Abidjan ?', 'Marché emblématique de la capitale économique', 'moyen', 'single_choice', 10, 25, FALSE),
(27, 'Dans quel quartier se trouve le marché de Cocody ?', 'Localisation de ce marché populaire', 'moyen', 'single_choice', 10, 25, FALSE),

-- FÊTES TRADITIONNELLES (sub_thematic_id = 21)
(21, 'La Fête de l\'Igname est célébrée par quel peuple ?', 'Célébration des nouvelles récoltes', 'moyen', 'single_choice', 15, 30, FALSE),
(21, 'Quand a lieu généralement la fête de Pâques chez les Agni ?', 'Période de célébration traditionnelle', 'difficile', 'single_choice', 20, 35, FALSE);

-- =========================================================
-- ✅ RÉPONSES COMPLÈTES
-- =========================================================
INSERT INTO quiz_answers (question_id, content, is_correct, display_order) VALUES
-- Question 1: Créateur Coupé-Décalé
(1, 'DJ Arafat', TRUE, 1),
(1, 'DJ Lewis', FALSE, 2),
(1, 'Serge Beynaud', FALSE, 3),
(1, 'Meiway', FALSE, 4),

-- Question 2: Ville de naissance Coupé-Décalé
(2, 'Paris', TRUE, 1),
(2, 'Abidjan', FALSE, 2),
(2, 'Bouaké', FALSE, 3),
(2, 'Londres', FALSE, 4),

-- Question 3: Signification Coupé-Décalé
(3, 'Se démarquer, innover', TRUE, 1),
(3, 'Danser rapidement', FALSE, 2),
(3, 'Chanter fort', FALSE, 3),
(3, 'Jouer de la musique', FALSE, 4),

-- Question 4: Contexte Zouglou
(4, 'Universités ivoiriennes', TRUE, 1),
(4, 'Marchés d\'Abidjan', FALSE, 2),
(4, 'Boîtes de nuit', FALSE, 3),
(4, 'Radios nationales', FALSE, 4),

-- Question 5: Groupe Zouglou
(5, 'Magic System', TRUE, 1),
(5, 'Les Poussins Chocs', FALSE, 2),
(5, 'Espoir 2000', FALSE, 3),
(5, 'Zouglou Stars', FALSE, 4),

-- Question 6: Alpha Blondy surnom
(6, 'Alpha Blondy', TRUE, 1),
(6, 'Tiken Jah Fakoly', FALSE, 2),
(6, 'Ismaël Isaac', FALSE, 3),
(6, 'Fadal Dey', FALSE, 4),

-- Question 7: Vrai nom Alpha Blondy
(7, 'Seydou Koné', TRUE, 1),
(7, 'Moussa Traoré', FALSE, 2),
(7, 'Ibrahim Ouattara', FALSE, 3),
(7, 'Amadou Bamba', FALSE, 4),

-- Question 8: Ingrédient attiéké
(8, 'Manioc', TRUE, 1),
(8, 'Igname', FALSE, 2),
(8, 'Riz', FALSE, 3),
(8, 'Maïs', FALSE, 4),

-- Question 9: Signification Kedjenou
(9, 'Plat cuit en vase clos', TRUE, 1),
(9, 'Sauce à l\'arachide', FALSE, 2),
(9, 'Poisson fumé', FALSE, 3),
(9, 'Légume vert', FALSE, 4),

-- Question 10: Ingrédients Foutou (multiple choice)
(10, 'Banane plantain', TRUE, 1),
(10, 'Igname', TRUE, 2),
(10, 'Manioc', TRUE, 3),
(10, 'Riz', FALSE, 4),
(10, 'Patate douce', FALSE, 5),

-- Question 11: Poisson avec attiéké
(11, 'Thon', TRUE, 1),
(11, 'Carpe', FALSE, 2),
(11, 'Tilapia', FALSE, 3),
(11, 'Sardine', FALSE, 4),

-- Question 12: Composition Garba
(12, 'Attiéké + thon frit', TRUE, 1),
(12, 'Riz + sauce', FALSE, 2),
(12, 'Foutou + viande', FALSE, 3),
(12, 'Pain + omelette', FALSE, 4),

-- Question 13: Bananes frites
(13, 'Alloco', TRUE, 1),
(13, 'Kplala', FALSE, 2),
(13, 'Beignet', FALSE, 3),
(13, 'Bofloto', FALSE, 4),

-- Question 14: CAN remportées
(14, '2', TRUE, 1),
(14, '1', FALSE, 2),
(14, '3', FALSE, 3),
(14, '4', FALSE, 4),

-- Question 15: Première CAN
(15, '1992', TRUE, 1),
(15, '1988', FALSE, 2),
(15, '1996', FALSE, 3),
(15, '2000', FALSE, 4),

-- Question 16: Légende Chelsea
(16, 'Didier Drogba', TRUE, 1),
(16, 'Salomon Kalou', FALSE, 2),
(16, 'Yaya Touré', FALSE, 3),
(16, 'Kolo Touré', FALSE, 4),

-- Question 17: "On dit quoi ?"
(17, 'Comment ça va ?', TRUE, 1),
(17, 'Qu\'est-ce qu\'on mange ?', FALSE, 2),
(17, 'Quelle heure est-il ?', FALSE, 3),
(17, 'Où vas-tu ?', FALSE, 4),

-- Question 18: Signification "Yako"
(18, 'Désolé, compassion', TRUE, 1),
(18, 'Bonjour', FALSE, 2),
(18, 'Merci', FALSE, 3),
(18, 'Au revoir', FALSE, 4),

-- Question 19: Signification "Dêh"
(19, 'Surprise, étonnement', TRUE, 1),
(19, 'Oui', FALSE, 2),
(19, 'Non', FALSE, 3),
(19, 'Peut-être', FALSE, 4),

-- Question 20: Région du Dioula
(20, 'Nord de la Côte d\'Ivoire', TRUE, 1),
(20, 'Sud forestier', FALSE, 2),
(20, 'Centre du pays', FALSE, 3),
(20, 'Littoral atlantique', FALSE, 4),

-- Question 21: Langue du centre
(21, 'Baoulé', TRUE, 1),
(21, 'Bété', FALSE, 2),
(21, 'Sénoufo', FALSE, 3),
(21, 'Malinké', FALSE, 4),

-- Question 22: Définition Gbaka
(22, 'Minibus de transport en commun', TRUE, 1),
(22, 'Moto-taxi', FALSE, 2),
(22, 'Taxi individuel', FALSE, 3),
(22, 'Pirogue motorisée', FALSE, 4),

-- Question 23: Taxis collectifs brousse
(23, 'Wôrô-wôrô', TRUE, 1),
(23, 'Car rapide', FALSE, 2),
(23, 'Taxi-brousse', FALSE, 3),
(23, 'Transport urbain', FALSE, 4),

-- Question 24: Plus grand marché Abidjan
(24, 'Marché d\'Adjamé', TRUE, 1),
(24, 'Marché de Cocody', FALSE, 2),
(24, 'Marché de Treichville', FALSE, 3),
(24, 'Marché de Yopougon', FALSE, 4),

-- Question 25: Quartier marché Cocody
(25, 'Cocody centre', TRUE, 1),
(25, 'Cocody-Danga', FALSE, 2),
(25, 'Riviera', FALSE, 3),
(25, 'Angré', FALSE, 4),

-- Question 26: Fête de l'Igname
(26, 'Peuple Baoulé', TRUE, 1),
(26, 'Peuple Bété', FALSE, 2),
(26, 'Peuple Sénoufo', FALSE, 3),
(26, 'Peuple Dioula', FALSE, 4),

-- Question 27: Pâques Agni
(27, 'Mars-Avril', TRUE, 1),
(27, 'Janvier-Février', FALSE, 2),
(27, 'Juillet-Août', FALSE, 3),
(27, 'Octobre-Novembre', FALSE, 4);

-- =========================================================
-- 🏆 ACHIEVEMENTS COMPLETS
-- =========================================================
INSERT INTO achievements (name, description, icon_url, badge_color, condition_type, condition_value, points_reward) VALUES
('Bienvenue à FunQuiz', 'Félicitations ! Tu as créé ton compte', '🎉', '#4ade80', 'games_played', 0, 20),
('Premier Quiz', 'Tu as terminé ton premier quiz', '🌟', '#fbbf24', 'games_played', 1, 50),
('Fan de Coupé-Décalé', 'Répondre correctement à 5 questions sur le Coupé-Décalé', '🎵', '#f97316', 'score', 50, 75),
('Expert en Attiéké', 'Maîtriser 10 questions sur la gastronomie ivoirienne', '🍽️', '#10b981', 'score', 100, 100),
('Supporter des Éléphants', 'Excellent score en quiz football ivoirien', '⚽', '#ef4444', 'score', 80, 90),
('Polyglotte', 'Réussir des quiz dans toutes les langues', '🗣️', '#3b82f6', 'games_played', 15, 120),
('Gardien de la Tradition', 'Expert en culture et traditions ivoiriennes', '🎭', '#8b5cf6', 'score', 200, 150),
('Citoyen Exemplaire', 'Connaître parfaitement la vie quotidienne ivoirienne', '🏠', '#06b6d4', 'games_played', 20, 130),
('Perfectionniste', 'Obtenir un score parfait de 100%', '💎', '#a855f7', 'perfect_score', 1, 200),
('Champion', 'Réaliser 5 scores parfaits', '🏆', '#ffd700', 'perfect_score', 5, 500),
('Joueur Assidu', 'Jouer 25 parties au total', '🎮', '#14b8a6', 'games_played', 25, 180),
('Speed Runner', 'Terminer un quiz en moins de 2 minutes', '⚡', '#f59e0b', 'time_spent', 120, 100),
('Érudit Ivoirien', 'Cumuler 1000 points au total', '📚', '#84cc16', 'score', 1000, 300),
('Ambassadeur Culturel', 'Partager 10 commentaires approuvés', '🌍', '#06b6d4', 'games_played', 50, 200);

-- =========================================================
-- 🎮 HISTORIQUE DE JEUX (EXEMPLES)
-- =========================================================
INSERT INTO quiz_game_history (user_id, sub_thematic_id, score, max_score, total_questions, correct_answers, time_spent, difficulty_level) VALUES
-- Jean-Baptiste (admin)
(1, 1, 90, 100, 10, 9, 145, 'facile'),
(1, 6, 80, 100, 10, 8, 180, 'facile'),
(1, 11, 100, 100, 10, 10, 120, 'moyen'),
(1, 16, 70, 100, 10, 7, 200, 'facile'),

-- Awa (user)
(2, 2, 60, 100, 10, 6, 240, 'moyen'),
(2, 9, 85, 100, 10, 8, 160, 'facile'),
(2, 17, 75, 100, 10, 7, 190, 'moyen'),
(2, 26, 90, 100, 10, 9, 140, 'facile'),

-- Moussa (moderator)
(3, 1, 100, 100, 10, 10, 95, 'facile'),
(3, 11, 85, 100, 10, 8, 170, 'moyen'),
(3, 21, 70, 100, 10, 7, 220, 'difficile'),

-- Aminata
(4, 6, 95, 100, 10, 9, 130, 'facile'),
(4, 9, 100, 100, 10, 10, 110, 'facile'),
(4, 27, 65, 100, 10, 6, 250, 'moyen'),

-- Seydou
(5, 16, 80, 100, 10, 8, 155, 'facile'),
(5, 26, 75, 100, 10, 7, 185, 'facile'),
(5, 3, 90, 100, 10, 9, 125, 'facile'),

-- Mariam
(6, 17, 70, 100, 10, 7, 210, 'moyen'),
(6, 21, 85, 100, 10, 8, 175, 'moyen'),
(6, 6, 100, 100, 10, 10, 105, 'facile'),

-- Christian
(7, 11, 95, 100, 10, 9, 135, 'moyen'),
(7, 1, 80, 100, 10, 8, 165, 'facile'),
(7, 16, 100, 100, 10, 10, 90, 'facile'),

-- Adjoua
(8, 9, 85, 100, 10, 8, 150, 'facile'),
(8, 26, 70, 100, 10, 7, 200, 'facile'),
(8, 2, 60, 100, 10, 6, 270, 'moyen'),

-- Ibrahim
(9, 17, 90, 100, 10, 9, 140, 'moyen'),
(9, 6, 75, 100, 10, 7, 190, 'facile'),
(9, 21, 80, 100, 10, 8, 180, 'difficile'),

-- Akissi
(10, 16, 100, 100, 10, 10, 85, 'facile'),
(10, 9, 90, 100, 10, 9, 125, 'facile'),
(10, 27, 70, 100, 10, 7, 215, 'moyen');

-- =========================================================
-- 🏅 ATTRIBUTION ACHIEVEMENTS
-- =========================================================
INSERT INTO quiz_user_achievements (user_id, achievement_id) VALUES
-- Jean-Baptiste
(1, 1), (1, 2), (1, 4), (1, 5), (1, 9), (1, 11),

-- Awa
(2, 1), (2, 2), (2, 8), (2, 11),

-- Moussa
(3, 1), (3, 2), (3, 3), (3, 9), (3, 11),

-- Aminata
(4, 1), (4, 2), (4, 4), (4, 9), (4, 11),

-- Seydou
(5, 1), (5, 2), (5, 6), (5, 11),

-- Mariam
(6, 1), (6, 2), (6, 7), (6, 9), (6, 11),

-- Christian
(7, 1), (7, 2), (7, 5), (7, 9), (7, 11),

-- Adjoua
(8, 1), (8, 2), (8, 4), (8, 11),

-- Ibrahim
(9, 1), (9, 2), (9, 6), (9, 7), (9, 11),

-- Akissi
(10, 1), (10, 2), (10, 6), (10, 9), (10, 12), (10, 11);

-- =========================================================
-- 💬 COMMENTAIRES D'EXEMPLE
-- =========================================================
INSERT INTO funquiz_comments (user_id, content, likes_count) VALUES
(2, 'Excellent quiz sur le Coupé-Décalé ! J\'ai appris des choses sur DJ Arafat 🎵', 5),
(4, 'Les questions sur l\'attiéké sont parfaites, ça me rappelle ma grand-mère 😊', 8),
(7, 'Bravo pour ce quiz sur les Éléphants ! Allez la Côte d\'Ivoire ! 🐘⚽', 12),
(6, 'J\'adore découvrir les expressions ivoiriennes, très instructif', 3),
(3, 'Quiz très bien fait, félicitations aux créateurs !', 6),
(8, 'Il faudrait ajouter plus de questions sur la musique Zouglou', 4),
(10, 'Parfait pour réviser notre culture ivoirienne 🇨🇮', 9),
(5, 'Les questions sur les marchés d\'Abidjan sont réalistes', 2);

-- Réponses aux commentaires
INSERT INTO funquiz_comments (user_id, parent_comment_id, content, likes_count) VALUES
(1, 6, 'Merci pour la suggestion ! Nous ajouterons bientôt plus de Zouglou', 3),
(3, 7, 'Merci Akissi ! Notre objectif est de promouvoir notre belle culture', 5);

-- =========================================================
-- 📬 MESSAGES DE CONTACT
-- =========================================================
INSERT INTO funquiz_messages (user_id, subject, content, priority, status) VALUES
(2, 'Suggestion de nouvelles questions', 'Bonjour, pourriez-vous ajouter des questions sur le reggae d\'Alpha Blondy ? Merci !', 'normal', 'read'),
(4, 'Bug dans le quiz gastronomie', 'J\'ai remarqué une erreur dans la question sur le kedjenou. La réponse ne s\'affiche pas correctement.', 'high', 'in_progress'),
(7, 'Félicitations', 'Bravo pour cette excellente application ! Elle nous aide à mieux connaître notre pays.', 'low', 'resolved'),
(NULL, 'Question sur les scores', 'Comment sont calculés les points ? Merci de me renseigner.', 'normal', 'unread');

-- Messages assignés
UPDATE funquiz_messages SET assigned_to = 1 WHERE message_id IN (2, 4);
UPDATE funquiz_messages SET assigned_to = 3 WHERE message_id = 1;

-- =========================================================
-- 📊 REQUÊTES UTILES POUR L'ADMINISTRATION
-- =========================================================

-- Voir le classement général des utilisateurs
-- SELECT * FROM user_points ORDER BY total_points DESC;

-- Questions les plus difficiles (faible taux de réussite)
-- SELECT 
--     q.content,
--     AVG(gh.completion_percentage) as success_rate,
--     COUNT(gh.history_id) as attempts
-- FROM quiz_questions q
-- JOIN quiz_sub_thematics st ON q.sub_thematic_id = st.sub_thematic_id
-- JOIN quiz_game_history gh ON st.sub_thematic_id = gh.sub_thematic_id
-- GROUP BY q.question_id
-- HAVING attempts >= 5
-- ORDER BY success_rate ASC
-- LIMIT 10;

-- Thématiques les plus populaires
-- SELECT 
--     t.title,
--     COUNT(gh.history_id) as games_played,
--     AVG(gh.score) as average_score
-- FROM quiz_thematics t
-- JOIN quiz_sub_thematics st ON t.thematic_id = st.thematic_id
-- JOIN quiz_game_history gh ON st.sub_thematic_id = gh.sub_thematic_id
-- GROUP BY t.thematic_id
-- ORDER BY games_played DESC;

-- Statistiques par utilisateur
-- SELECT 
--     u.first_name,
--     u.name,
--     COUNT(gh.history_id) as total_games,
--     AVG(gh.score) as moyenne_score,
--     MAX(gh.score) as meilleur_score,
--     COUNT(ua.achievement_id) as total_badges
-- FROM funquiz_users u
-- LEFT JOIN quiz_game_history gh ON u.user_id = gh.user_id
-- LEFT JOIN quiz_user_achievements ua ON u.user_id = ua.user_id
-- GROUP BY u.user_id
-- ORDER BY total_games DESC;

-- =========================================================
-- ✅ SCRIPT TERMINÉ - FUNQUIZ CÔTE D'IVOIRE PRÊT ! 🇨🇮
-- =========================================================

-- Pour tester la base de données :
-- SELECT 'Base de données FunQuiz créée avec succès !' as message;
-- SELECT COUNT(*) as total_users FROM funquiz_users;
-- SELECT COUNT(*) as total_questions FROM quiz_questions;
-- SELECT COUNT(*) as total_games FROM quiz_game_history;
-- SELECT * FROM user_points ORDER BY total_points DESC LIMIT 5;