-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : mer. 11 fév. 2026 à 13:01
-- Version du serveur : 5.7.24
-- Version de PHP : 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `funquiz`
--

CREATE TABLE `funquiz_role_permissions` (
  `role` enum('admin','moderator','user') NOT NULL,
  `permissions` json NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `funquiz_role_permissions` (`role`, `permissions`) VALUES
('admin', '{"users_view": true, "users_edit": true, "users_delete": true, "comments_view": true, "comments_approve": true, "comments_delete": true, "quiz_view": true, "quiz_edit": true, "quiz_delete": true, "settings_view": true, "settings_edit": true, "about_edit": true, "logs_view": true}'),
('moderator', '{"users_view": true, "users_edit": false, "users_delete": false, "comments_view": true, "comments_approve": true, "comments_delete": true, "quiz_view": true, "quiz_edit": true, "quiz_delete": false, "settings_view": false, "settings_edit": false, "about_edit": false, "logs_view": false}'),
('user', '{"users_view": false, "users_edit": false, "users_delete": false, "comments_view": false, "comments_approve": false, "comments_delete": false, "quiz_view": false, "quiz_edit": false, "quiz_delete": false, "settings_view": false, "settings_edit": false, "about_edit": false, "logs_view": false}');

CREATE TABLE `moderator_actions` (
  `action_id` int(11) NOT NULL AUTO_INCREMENT,
  `moderator_id` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`action_id`),
  KEY `moderator_id` (`moderator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `funquiz_settings` (
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `funquiz_settings` (`setting_key`, `setting_value`) VALUES
('MAIL_PROVIDER', 'smtp'),
('RESEND_API_KEY', ''),
('SMTP_HOST', ''),
('SMTP_PORT', '587'),
('SMTP_USER', ''),
('SMTP_PASS', ''),
('SMTP_SECURE', 'false'),
('MAIL_FROM', 'FunQuiz <no-reply@funquiz.com>');


CREATE TABLE `about` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `mission` text,
  `vision` text,
  `contact_email` varchar(255) DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'published',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `about`
--

INSERT INTO `about` (`id`, `title`, `subtitle`, `description`, `mission`, `vision`, `contact_email`, `status`, `created_at`, `updated_at`) VALUES
(1, 'À propos de notre plateforme', 'D', 'N', 'O', 'D', 'app@funquiz.fr', 'published', '2025-10-09 14:14:47', '2025-10-10 01:38:51'),
(2, 'Pour nous', 'sub pour nous', 'desc pour nous', 'mission pour nous', 'vision pour nous', 'pournous@gmail.com', 'published', '2025-10-10 00:47:49', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `achievements`
--

CREATE TABLE `achievements` (
  `achievement_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `icon_url` varchar(500) DEFAULT NULL,
  `badge_color` varchar(7) DEFAULT '#ffd700',
  `condition_type` enum('score','games_played','streak','perfect_score','time_spent') NOT NULL,
  `condition_value` int(11) NOT NULL,
  `points_reward` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `achievements`
--

INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `icon_url`, `badge_color`, `condition_type`, `condition_value`, `points_reward`, `is_active`, `created_at`) VALUES
(1, 'Bienvenue à FunQuiz', 'Félicitations ! Tu as créé ton compte', '🎉', '#4ade80', 'games_played', 0, 20, 1, '2025-09-25 07:16:28'),
(2, 'Premier Quiz', 'Tu as terminé ton premier quiz', '🌟', '#fbbf24', 'games_played', 1, 50, 1, '2025-09-25 07:16:28'),
(3, 'Fan de Coupé-Décalé', 'Répondre correctement à 5 questions sur le Coupé-Décalé', '🎵', '#f97316', 'score', 50, 75, 1, '2025-09-25 07:16:28'),
(4, 'Expert en Attiéké', 'Maîtriser 10 questions sur la gastronomie ivoirienne', '🍽️', '#10b981', 'score', 100, 100, 1, '2025-09-25 07:16:28'),
(5, 'Supporter des Éléphants', 'Excellent score en quiz football ivoirien', '⚽', '#ef4444', 'score', 80, 90, 1, '2025-09-25 07:16:28'),
(6, 'Polyglotte', 'Réussir des quiz dans toutes les langues', '🗣️', '#3b82f6', 'games_played', 15, 120, 1, '2025-09-25 07:16:28'),
(7, 'Gardien de la Tradition', 'Expert en culture et traditions ivoiriennes', '🎭', '#8b5cf6', 'score', 200, 150, 1, '2025-09-25 07:16:28'),
(8, 'Citoyen Exemplaire', 'Connaître parfaitement la vie quotidienne ivoirienne', '🏠', '#06b6d4', 'games_played', 20, 130, 1, '2025-09-25 07:16:28'),
(9, 'Perfectionniste', 'Obtenir un score parfait de 100%', '💎', '#a855f7', 'perfect_score', 1, 200, 1, '2025-09-25 07:16:28'),
(10, 'Champion', 'Réaliser 5 scores parfaits', '🏆', '#ffd700', 'perfect_score', 5, 500, 1, '2025-09-25 07:16:28'),
(11, 'Joueur Assidu', 'Jouer 25 parties au total', '🎮', '#14b8a6', 'games_played', 25, 180, 1, '2025-09-25 07:16:28'),
(12, 'Speed Runner', 'Terminer un quiz en moins de 2 minutes', '⚡', '#f59e0b', 'time_spent', 120, 100, 1, '2025-09-25 07:16:28'),
(13, 'Érudit Ivoirien', 'Cumuler 1000 points au total', '📚', '#84cc16', 'score', 1000, 300, 1, '2025-09-25 07:16:28'),
(14, 'Ambassadeur Culturel', 'Partager 10 commentaires approuvés', '🌍', '#06b6d4', 'games_played', 50, 200, 1, '2025-09-25 07:16:28');

-- --------------------------------------------------------

--
-- Structure de la table `cgu`
--

CREATE TABLE `cgu` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('draft','published') DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `cgu`
--

INSERT INTO `cgu` (`id`, `title`, `content`, `date_created`, `date_updated`, `status`) VALUES
(1, 'Conditions Générales d’Utilisation', 'Ces conditions régissent l’utilisation de notre plateforme. En utilisant nos services, vous acceptez pleinement ces conditions.', '2025-10-09 14:14:47', '2025-10-09 14:58:00', 'published'),
(2, 'test', 'tes', '2025-10-09 15:01:44', '2025-10-09 19:41:39', 'published');

-- --------------------------------------------------------

--
-- Structure de la table `contact`
--

CREATE TABLE `contact` (
  `id` int(11) NOT NULL,
  `service` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('operationnel','cacher') DEFAULT 'operationnel'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `contact`
--

INSERT INTO `contact` (`id`, `service`, `email`, `content`, `created_at`, `status`) VALUES
(2, 'juridique', 'ahobautfrederick@gmail.com', 'Texte section juridique', '2025-10-09 17:24:25', 'operationnel'),
(3, 'Marketing', 'marketing@gmail.com', 'texte section marketing', '2025-10-09 20:11:34', 'operationnel');

-- --------------------------------------------------------

--
-- Structure de la table `cookies_policy`
--

CREATE TABLE `cookies_policy` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('draft','published') DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `cookies_policy`
--

INSERT INTO `cookies_policy` (`id`, `title`, `content`, `date_created`, `date_updated`, `status`) VALUES
(1, 'Politique des Cookies', 'Notre site utilise des cookies pour personnaliser le contenu et analyser le trafic. Vous pouvez refuser ou accepter ces cookies.', '2025-10-09 14:14:47', NULL, 'published');

-- --------------------------------------------------------

--
-- Structure de la table `funquiz_comments`
--

CREATE TABLE `funquiz_comments` (
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_comment_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `is_approved` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_visible` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `funquiz_comments`
--

INSERT INTO `funquiz_comments` (`comment_id`, `user_id`, `parent_comment_id`, `content`, `is_approved`, `created_at`, `updated_at`, `is_visible`) VALUES
(1, 2, NULL, 'Excellent quiz sur le Coupé-Décalé ! J\'ai appris des choses sur DJ Arafat 🎵', 1, '2025-09-25 07:16:28', '2026-02-09 22:01:45', 1),
(2, 4, NULL, 'Les questions sur l\'attiéké sont parfaites, ça me rappelle ma grand-mère 😊', 1, '2025-09-25 07:16:28', '2026-02-09 22:01:50', 0),
(3, 7, NULL, 'Bravo pour ce quiz sur les Éléphants ! Allez la Côte d\'Ivoire ! 🐘⚽', 1, '2025-09-25 07:16:28', '2025-10-07 16:30:52', 1),
(4, 6, NULL, 'J\'adore découvrir les expressions ivoiriennes, très instructif', 1, '2025-09-25 07:16:28', '2025-10-07 17:36:33', 0),
(5, 3, NULL, 'Quiz très bien fait, félicitations aux créateurs !', 1, '2025-09-25 07:16:28', '2025-10-07 17:36:17', 0),
(6, 8, NULL, 'Il faudrait ajouter plus de questions sur la musique Zouglou', 1, '2025-09-25 07:16:28', '2025-10-07 17:36:10', 0),
(7, 10, NULL, 'Parfait pour réviser notre culture ivoirienne 🇨🇮', 1, '2025-09-25 07:16:28', '2026-02-01 01:11:31', 0),
(8, 5, NULL, 'Les questions sur les marchés d\'Abidjan sont réalistes', 1, '2025-09-25 07:16:28', '2025-09-25 07:16:28', 0),
(9, 1, 6, 'Merci pour la suggestion ! Nous ajouterons bientôt plus de Zouglou', 1, '2025-09-25 07:16:28', '2026-02-01 01:12:11', 1),
(10, 3, 7, 'Merci Akissi ! Notre objectif est de promouvoir notre belle culture', 1, '2025-09-25 07:16:28', '2025-09-25 07:16:28', 0);

-- --------------------------------------------------------

--
-- Structure de la table `funquiz_faq`
--

CREATE TABLE `funquiz_faq` (
  `faq_id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `funquiz_faq`
--

INSERT INTO `funquiz_faq` (`faq_id`, `question`, `answer`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Qu\'est-ce que FunQuiz ?', 'FunQuiz est une plateforme interactive où tu peux jouer à des quiz, gagner des points, débloquer des succès et défier d\'autres joueurs.', 0, '2025-09-29 09:15:52', '2025-10-09 17:38:07'),
(2, 'Comment créer un compte ?', 'Clique sur le bouton \"S\'inscrire\", remplis tes informations ou connecte-toi directement avec ton compte Google.', 0, '2025-09-29 09:15:52', '2025-10-09 17:41:50'),
(3, 'Comment sont calculés les points ?', 'Tu gagnes des points en fonction des bonnes réponses, du temps de complétion des quiz et des succès spéciaux débloqués.', 1, '2025-09-29 09:15:52', '2025-09-29 09:15:52'),
(4, 'Puis-je mettre ma propre photo de profil ?', 'Oui ! Va dans les paramètres de ton profil, clique sur \"Télécharger un avatar\" et choisis une image au format .webp.', 1, '2025-09-29 09:15:52', '2025-09-29 09:15:52'),
(5, 'Que faire si j\'ai oublié mon mot de passe ?', 'Clique sur \"Mot de passe oublié\" sur la page de connexion et suis les étapes pour le réinitialiser via ton email.', 1, '2025-09-29 09:15:52', '2025-09-29 09:15:52'),
(6, 'Est-ce que FunQuiz est gratuit ?', 'Oui, FunQuiz est gratuit ! Certaines fonctionnalités premium pourront être ajoutées à l\'avenir, mais l\'expérience principale reste gratuite.', 1, '2025-09-29 09:15:52', '2025-09-29 09:15:52'),
(7, 'Comment défier un ami ?', 'Depuis le tableau de bord, sélectionne un quiz et invite un ami en utilisant son pseudo ou son adresse email.', 1, '2025-09-29 09:15:52', '2025-09-29 09:15:52'),
(8, 'Comment contacter le support ?', 'Tu peux contacter le support via la section \"Aide & Support\" dans le menu ou en envoyant un mail à support@funquiz.com.', 0, '2025-09-29 09:15:52', '2025-10-09 18:01:32');

-- --------------------------------------------------------

--
-- Structure de la table `funquiz_messages`
--

CREATE TABLE `funquiz_messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) DEFAULT NULL,
  `content_admin` text,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `status` enum('unread','read','in_progress','resolved','closed') DEFAULT 'unread',
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `funquiz_newsletter`
--

CREATE TABLE `funquiz_newsletter` (
  `newsletter_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `subscribed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `funquiz_newsletter`
--

INSERT INTO `funquiz_newsletter` (`newsletter_id`, `user_id`, `email`, `subscribed_at`, `confirmed`, `created_at`) VALUES
(2, 41, 'aaahobaut@gmail.com', '2026-01-31 18:55:03', 1, '2026-01-31 18:55:03'),
(3, 41, 'aaahobautfrederick@gmil.com', '2026-01-31 18:55:27', 1, '2026-01-31 18:55:27'),
(4, 41, 'ahobautfrederick@gmail.com', '2026-01-31 18:55:51', 1, '2026-01-31 18:55:51'),
(5, 11, 'ahobau_a@etna-alternance.net', '2026-02-09 22:59:43', 1, '2026-02-09 22:59:43');

-- --------------------------------------------------------

--
-- Structure de la table `funquiz_private_messages`
--

CREATE TABLE `funquiz_private_messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `funquiz_private_messages`
--

INSERT INTO `funquiz_private_messages` (`message_id`, `sender_id`, `receiver_id`, `content`, `created_at`, `read_at`) VALUES
(1, 11, 41, 'freddy', '2026-01-31 22:05:45', NULL),
(2, 42, 1, 'hello', '2026-02-01 01:28:22', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `funquiz_users`
--

CREATE TABLE `funquiz_users` (
  `user_id` int(11) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `avatar_url` text,
  `first_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `number` varchar(20) DEFAULT NULL,
  `is_verify` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = non vérifié, 1 = vérifié',
  `password_hash` varchar(255) DEFAULT NULL,
  `reset_code` varchar(8) DEFAULT NULL,
  `reset_expiry` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `status` enum('active','suspended','deleted') DEFAULT 'active',
  `role` enum('user','admin','moderator') DEFAULT 'user',
  `preferences` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_cx` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `funquiz_users`
--

INSERT INTO `funquiz_users` (`user_id`, `google_id`, `name`, `avatar_url`, `first_name`, `email`, `number`, `is_verify`, `password_hash`, `reset_code`, `reset_expiry`, `is_active`, `status`, `role`, `created_at`, `updated_at`, `date_cx`) VALUES
(1, NULL, 'fredfred', '/uploads/users/avatar-1759130934678.webp', 'Frédérick', 'nouveau@mail.com', '758123456', 0, '$2b$10$9iTcVp4Mq4B2V9u07BOCNO1GR1wQZ2KfLm30nEMV0BvJxvFt8RIdu', NULL, NULL, 1, 'active', 'admin', '2025-09-25 07:16:27', '2025-10-06 23:59:04', NULL),
(2, NULL, 'Traoré', '/uploads/users/avatar-1759176910095.jpg', 'Awa Fatou', 'awa.traore@example.ci', '102030406', 0, '$2y$10$hash_awa', NULL, NULL, 1, 'active', 'user', '2025-09-25 07:16:27', '2026-02-01 01:02:55', NULL),
(3, NULL, 'Koné', NULL, 'Moussa', 'moussa.kone@example.ci', '102030407', 0, '$2y$10$hash_moussa', NULL, NULL, 0, 'active', 'moderator', '2025-09-25 07:16:27', '2026-02-01 00:47:17', NULL),
(4, NULL, 'Ouattara', '/uploads/users/avatar-1759176938377.jpg', 'Aminata', 'aminata.ouattara@example.ci', '102030408', 0, '$2y$10$hash_aminata', NULL, NULL, 1, 'active', 'user', '2025-09-25 07:16:27', '2025-10-06 23:59:04', NULL),
(6, NULL, 'Diabaté', '/uploads/users/avatar-1759135650722.jpg', 'Mariam', 'mariam.diabate@example.ci', '102030410', 0, '$2y$10$hash_mariam', NULL, NULL, 1, 'active', 'user', '2025-09-25 07:16:27', '2025-10-06 23:59:04', NULL),
(7, NULL, 'Yao', '/uploads/users/avatar-1759176977621.jpg', 'Christian', 'christian.yao@example.ci', '102030411', 0, '$2y$10$hash_christian', NULL, NULL, 1, 'active', 'user', '2025-09-25 07:16:27', '2026-01-31 23:46:42', NULL),
(8, NULL, 'N\'Guessan', NULL, 'Adjoua', 'adjoua.nguessan@example.ci', '102030412', 0, '$2y$10$hash_adjoua', NULL, NULL, 1, 'active', 'user', '2025-09-25 07:16:27', '2025-10-06 23:59:04', NULL),
(9, NULL, 'Sangaré', NULL, 'Ibrahim', 'ibrahim.sangare@example.ci', '102030413', 0, '$2y$10$hash_ibrahim', NULL, NULL, 1, 'active', 'user', '2025-09-25 07:16:27', '2025-10-06 23:59:04', NULL),
(10, NULL, 'Kouamé', '/uploads/users/avatar-1759135171178.jpg', 'Akissi', 'akissi.kouame@example.ci', '102030414', 0, '$2y$10$hash_akissi', NULL, NULL, 1, 'active', 'user', '2025-09-25 07:16:27', '2025-10-06 23:59:04', NULL),
(11, NULL, 'Ahobaut', '/uploads/users/avatar-1759178474108.webp', 'Ayméric', 'ahobautfrederick@gmail.com', '33610694708', 1, '$2b$10$JqhGiQ1QKeneneDbm/uc6.X2Gif5kSIGxgiA9kZSYSHwj8FFhDoCG', NULL, NULL, 1, 'active', 'admin', '2025-09-25 08:21:07', '2026-02-09 21:00:08', '2026-02-09 22:00:08'),
(12, '110748433686325263462', 'Freddy Taylor', 'https://lh3.googleusercontent.com/a/ACg8ocIaJFFInQvPVTF7sURmin6gmKu1g1Xj3NGaNqG0DjVN_ikkHGyAqg=s96-c', 'Frédérick', 'freddytaylor2017@gmail.com', '0', 0, NULL, NULL, NULL, 1, 'active', 'admin', '2025-09-25 15:18:33', '2026-01-31 23:51:11', NULL),
(20, NULL, 'fatim', NULL, 'fatim', 'kefatima@gmail.com', '33758704507', 0, '$2b$10$dr4CfSTmTnKWBpOzbG6LheKqf67YxonzHkjkZcJ59TTFh5m1NUvwe', '290273', '2025-10-02 23:07:41', 1, 'active', 'admin', '2025-10-02 19:50:21', '2025-10-06 23:59:42', NULL),
(31, NULL, 'Rosine', NULL, 'Wadja', 'rosinewadja@gmail.com', NULL, 0, '$2b$10$XTK4iQxWXXnWTDhe4ngs0u.ls.VVffpIZMWk0OQ.pYHqhRv1V39VO', NULL, NULL, 0, 'suspended', 'admin', '2025-10-06 21:39:06', '2026-02-01 01:03:03', '2025-10-06 23:39:07'),
(39, NULL, 'Frédérick', NULL, 'Ahobaut', 'aaahobaut@gmail.com', 'none', 0, '$2b$10$qzhhN8GBMHGUzOo0soPYgeoL17jqa79WVekhF0JERDqdRBBeCLxJm', NULL, NULL, 1, 'active', 'user', '2026-01-31 02:36:48', '2026-02-09 20:58:06', '2026-02-09 21:58:07'),
(40, NULL, 'sephora', NULL, 'tres', 'sephorakouame43@gmail.com', 'none', 0, '$2b$10$xEskF.lH7LXkZZYxmEaqFO3pCirQVPJKS4Lyt6oJjTdFPHIpeXbn.', NULL, NULL, 1, 'active', 'user', '2026-01-31 02:45:22', '2026-01-31 02:45:33', '2026-01-31 03:45:33'),
(41, NULL, 'Frédérick', '/uploads/users/avatar-1769884178710.webp', 'Ahobaut', 'ahobauttt@gmail.com', '2222222222', 0, '$2b$10$3Mm8aYLGIPj/.4CKk3/Hr.lpZlRJzImNLQXGnu1dd/gcDVDHmYkEW', NULL, NULL, 1, 'active', 'user', '2026-01-31 14:08:56', '2026-01-31 18:29:38', '2026-01-31 15:09:54'),
(42, NULL, 'Noad', NULL, 'Sayeh', 'quickpopnoreply@gmail.com', '0610694708', 0, '$2b$10$jXk8CMtUnsOvSaKLfJk/XOU0qw7AxOqowDLRXzvPSo/J9Mvh6zhBu', '924003', '2026-02-01 02:53:36', 1, 'active', 'user', '2026-02-01 01:14:14', '2026-02-01 01:43:36', '2026-02-01 02:43:15');

-- --------------------------------------------------------

--
-- Structure de la table `privacy_policy`
--

CREATE TABLE `privacy_policy` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('draft','published') DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `privacy_policy`
--

INSERT INTO `privacy_policy` (`id`, `title`, `content`, `date_created`, `date_updated`, `status`) VALUES
(1, 'Politique de Confidentialité', 'Nous collectons certaines données pour améliorer nos services. Ces informations sont protégées et ne seront jamais vendues à des tier', '2025-10-09 14:14:47', '2025-10-09 14:57:53', 'published');

-- --------------------------------------------------------

--
-- Structure de la table `publicite`
--

CREATE TABLE `publicite` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `statut` enum('actif','inactif','expiré') DEFAULT 'inactif',
  `type` enum('image','popup','banniere') DEFAULT 'image',
  `clics` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `answer_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_option1` text CHARACTER SET utf8mb4 NOT NULL,
  `answer_option2` text CHARACTER SET utf8mb4 NOT NULL,
  `answer_option3` text CHARACTER SET utf8mb4 NOT NULL,
  `correct_option` tinyint(4) NOT NULL,
  `answer_type` enum('text','image','audio','video') CHARACTER SET utf8mb4 DEFAULT 'text',
  `media_url` varchar(500) CHARACTER SET utf8mb4 DEFAULT NULL,
  `points_value` int(11) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `quiz_answers`
--

INSERT INTO `quiz_answers` (`answer_id`, `question_id`, `answer_option1`, `answer_option2`, `answer_option3`, `correct_option`, `answer_type`, `media_url`, `points_value`, `created_at`) VALUES
(1, 1, 'Dj Araf', 'dj ', 'dj ', 1, 'text', NULL, 12, '2025-09-26 21:49:29'),
(2, 2, 'Chien', 'Chat', 'Lapin', 2, 'text', NULL, 1, '2025-09-26 21:49:29'),
(3, 3, 'Bleu', 'Rouge', 'Vert', 3, 'text', NULL, 1, '2025-09-26 21:49:29'),
(20, 49, 'Une équation de degré 2', 'Une somme de termes de la forme a*x^n', 'Une intégrale indéfinie', 1, 'text', NULL, 5, '2025-10-10 11:12:51'),
(21, 50, 'Une équation de degré 3', 'Une somme de termes de la forme a*x^n', 'Une intégrale indéfinie', 1, 'text', NULL, 5, '2025-10-10 11:12:51'),
(22, 51, 'Une équation de degré 2', 'Une somme de termes de la forme a*x^n', 'Une intégrale indéfinie', 1, 'text', NULL, 5, '2025-10-10 11:17:14'),
(23, 52, 'Une équation de degré 3', 'Une somme de termes de la forme a*x^n', 'Une intégrale indéfinie', 1, 'text', NULL, 5, '2025-10-10 11:17:14');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_game_history`
--

CREATE TABLE `quiz_game_history` (
  `history_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sub_thematic_id` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT '0',
  `max_score` int(11) NOT NULL,
  `total_questions` int(11) NOT NULL,
  `correct_answers` int(11) DEFAULT '0',
  `time_spent` int(11) DEFAULT NULL,
  `difficulty_level` enum('facile','moyen','difficile') DEFAULT NULL,
  `completion_percentage` decimal(5,2) GENERATED ALWAYS AS ((case when (`total_questions` > 0) then ((`correct_answers` * 100.0) / `total_questions`) else 0 end)) STORED,
  `played_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_game_history`
--

INSERT INTO `quiz_game_history` (`history_id`, `user_id`, `sub_thematic_id`, `score`, `max_score`, `total_questions`, `correct_answers`, `time_spent`, `difficulty_level`, `played_at`) VALUES
(1, 1, 1, 90, 100, 10, 9, 145, 'facile', '2025-09-25 07:16:28'),
(2, 1, 6, 80, 100, 10, 8, 180, 'facile', '2025-09-25 07:16:28'),
(3, 1, 11, 100, 100, 10, 10, 120, 'moyen', '2025-09-25 07:16:28'),
(4, 1, 16, 70, 100, 10, 7, 200, 'facile', '2025-09-25 07:16:28'),
(5, 2, 2, 60, 100, 10, 6, 240, 'moyen', '2025-09-25 07:16:28'),
(6, 2, 9, 85, 100, 10, 8, 160, 'facile', '2025-09-25 07:16:28'),
(7, 2, 17, 75, 100, 10, 7, 190, 'moyen', '2025-09-25 07:16:28'),
(8, 2, 26, 90, 100, 10, 9, 140, 'facile', '2025-09-25 07:16:28'),
(9, 3, 1, 100, 100, 10, 10, 95, 'facile', '2025-09-25 07:16:28'),
(10, 3, 11, 85, 100, 10, 8, 170, 'moyen', '2025-09-25 07:16:28'),
(11, 3, 21, 70, 100, 10, 7, 220, 'difficile', '2025-09-25 07:16:28'),
(12, 4, 6, 95, 100, 10, 9, 130, 'facile', '2025-09-25 07:16:28'),
(13, 4, 9, 100, 100, 10, 10, 110, 'facile', '2025-09-25 07:16:28'),
(14, 4, 27, 65, 100, 10, 6, 250, 'moyen', '2025-09-25 07:16:28'),
(15, 5, 16, 80, 100, 10, 8, 155, 'facile', '2025-09-25 07:16:28'),
(16, 5, 26, 75, 100, 10, 7, 185, 'facile', '2025-09-25 07:16:28'),
(17, 5, 3, 90, 100, 10, 9, 125, 'facile', '2025-09-25 07:16:28'),
(18, 6, 17, 70, 100, 10, 7, 210, 'moyen', '2025-09-25 07:16:28'),
(19, 6, 21, 85, 100, 10, 8, 175, 'moyen', '2025-09-25 07:16:28'),
(20, 6, 6, 100, 100, 10, 10, 105, 'facile', '2025-09-25 07:16:28'),
(21, 7, 11, 95, 100, 10, 9, 135, 'moyen', '2025-09-25 07:16:28'),
(22, 7, 1, 80, 100, 10, 8, 165, 'facile', '2025-09-25 07:16:28'),
(23, 7, 16, 100, 100, 10, 10, 90, 'facile', '2025-09-25 07:16:28'),
(24, 8, 9, 85, 100, 10, 8, 150, 'facile', '2025-09-25 07:16:28'),
(25, 8, 26, 70, 100, 10, 7, 200, 'facile', '2025-09-25 07:16:28'),
(26, 8, 2, 60, 100, 10, 6, 270, 'moyen', '2025-09-25 07:16:28'),
(27, 9, 17, 90, 100, 10, 9, 140, 'moyen', '2025-09-25 07:16:28'),
(28, 9, 6, 75, 100, 10, 7, 190, 'facile', '2025-09-25 07:16:28'),
(29, 9, 21, 80, 100, 10, 8, 180, 'difficile', '2025-09-25 07:16:28'),
(30, 10, 16, 100, 100, 10, 10, 85, 'facile', '2025-09-25 07:16:28'),
(31, 10, 9, 90, 100, 10, 9, 125, 'facile', '2025-09-25 07:16:28'),
(32, 10, 27, 70, 100, 10, 7, 215, 'moyen', '2025-09-25 07:16:28'),
(33, 1, NULL, 1, 1, 1, 0, NULL, NULL, '2025-09-27 00:30:02'),
(34, 1, NULL, 1, 1, 1, 0, NULL, NULL, '2025-09-27 00:30:14'),
(35, 1, NULL, 1, 1, 1, 0, NULL, NULL, '2025-09-27 00:30:56'),
(36, 1, NULL, 1, 1, 1, 0, NULL, NULL, '2025-09-27 00:31:03'),
(37, 1, NULL, 1, 1, 1, 0, NULL, NULL, '2025-09-27 00:38:11'),
(38, 1, NULL, 1, 1, 1, 0, NULL, NULL, '2025-09-27 00:38:21'),
(39, 1, NULL, 0, 1, 1, 0, NULL, NULL, '2025-09-27 00:58:14'),
(40, 1, NULL, 1, 1, 1, 1, NULL, NULL, '2025-09-27 00:58:23'),
(41, 1, NULL, 1, 1, 1, 1, NULL, NULL, '2025-09-27 00:58:25'),
(42, 1, 1, 0, 1, 1, 0, NULL, NULL, '2025-09-27 11:00:15'),
(43, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:00:21'),
(44, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:00:23'),
(45, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:09:22'),
(46, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:09:25'),
(47, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:09:27'),
(48, 1, 1, 0, 1, 1, 0, NULL, NULL, '2025-09-27 11:09:56'),
(49, 1, 1, 0, 1, 1, 0, NULL, NULL, '2025-09-27 11:10:11'),
(50, 1, 1, 0, 1, 1, 0, NULL, NULL, '2025-09-27 11:10:17'),
(51, 1, 1, 0, 1, 1, 0, NULL, NULL, '2025-09-27 11:10:23'),
(52, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:10:28'),
(53, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:16:26'),
(54, 12, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 11:19:50'),
(55, 12, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 12:54:57'),
(56, 12, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 12:54:59'),
(57, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 12:55:09'),
(58, 1, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 12:55:18'),
(59, 11, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-27 12:57:51'),
(60, 11, 1, 1, 1, 1, 1, NULL, NULL, '2025-09-28 14:18:36'),
(61, 11, 51, 5, 5, 1, 1, NULL, NULL, '2025-10-10 12:13:58'),
(62, 11, 51, 0, 5, 1, 0, NULL, NULL, '2025-10-10 12:13:58'),
(63, 11, 51, 0, 5, 1, 0, NULL, NULL, '2025-10-10 12:13:58');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `question_id` int(11) NOT NULL,
  `sub_thematic_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `explanation` text,
  `difficulty_level` enum('facile','moyen','difficile') DEFAULT 'moyen',
  `question_type` enum('multiple_choice','single_choice','true_false','text_input') DEFAULT 'multiple_choice',
  `points` int(11) DEFAULT '10',
  `time_limit` int(11) DEFAULT '30',
  `allow_multiple_correct` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `media_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_questions`
--

INSERT INTO `quiz_questions` (`question_id`, `sub_thematic_id`, `content`, `explanation`, `difficulty_level`, `question_type`, `points`, `time_limit`, `allow_multiple_correct`, `is_active`, `created_at`, `updated_at`, `media_url`) VALUES
(1, 1, 'Qui est considéré comme le créateur du Coupé-Décal', 'DJ Arafat (Ange Didier Houon) et la Jet Set ont popularisé ce mouvement musical dans le années 200', 'moyen', 'single_choice', 12, 26, 0, 0, '2025-09-25 07:16:27', '2025-10-09 11:17:33', 'https://i.pinimg.com/1200x/ca/e5/de/cae5deac73e907e90734e896d0955bf7'),
(2, 1, 'Dans quelle ville le Coupé-Décalé est-il né ?', 'Ce genre musical est né à Paris dans la diaspora ivoirienne avant de conquérir la Côte d\'Ivoire', 'moyen', 'single_choice', 15, 30, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(3, 1, 'Que signifie \"Coupé-Décalé\" ?', 'Expression qui évoque le fait de \"couper\" et de \"décaler\", de se démarquer', 'facile', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(4, 2, 'Le Zouglou est né dans quel contexte ?', 'Musique de protestation née dans les résidences universitaires dans les années 90', 'moyen', 'single_choice', 15, 35, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(5, 2, 'Quel groupe a popularisé le Zouglou ?', 'Magic System est l\'un des groupes emblématiques de ce genre', 'facile', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(6, 3, 'Quel artiste ivoirien est surnommé le \"Reggae Man d\'Afrique\" ?', 'Alpha Blondy est la figure emblématique du reggae africain', 'facile', 'single_choice', 10, 20, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(7, 3, 'Quel est le vrai nom d\'Alpha Blondy ?', 'Nom de naissance de cette légende du reggae ivoirien', 'moyen', 'single_choice', 15, 30, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(8, 6, 'L\'attiéké est fait à base de quel ingrédient principal ?', 'Semoule de manioc fermenté, spécialité des peuples lagunaires', 'facile', 'single_choice', 5, 20, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(9, 6, 'Que signifie \"Kedjenou\" ?', 'Plat traditionnel cuit en vase clos sans ajout d\'eau', 'facile', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(10, 6, 'Le Foutou est composé de quels ingrédients ? (Plusieurs réponses possibles)', 'Plat à base de tubercules pilés', 'moyen', 'multiple_choice', 15, 40, 1, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(11, 6, 'Quel poisson accompagne traditionnellement l\'attiéké ?', 'Poisson grillé typique des plats lagunaires', 'moyen', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(12, 9, 'Le \"Garba\" est composé de quoi ?', 'Plat populaire des étudiants et jeunes travailleurs', 'facile', 'single_choice', 5, 20, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(13, 9, 'Comment appelle-t-on les bananes frites en Côte d\'Ivoire ?', 'Accompagnement très populaire dans la cuisine ivoirienne', 'facile', 'single_choice', 5, 18, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(14, 11, 'Combien de Coupes d\'Afrique des Nations la Côte d\'Ivoire a-t-elle remportées ?', 'Les Éléphants ont été sacrés champions d\'Afrique', 'moyen', 'single_choice', 15, 30, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(15, 11, 'En quelle année la Côte d\'Ivoire a-t-elle remporté sa première CAN ?', 'Première victoire historique des Éléphants', 'moyen', 'single_choice', 15, 30, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(16, 11, 'Quel joueur ivoirien est devenu une légende à Chelsea ?', 'Buteur emblématique des Éléphants', 'facile', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(17, 16, 'Que signifie l\'expression \"On dit quoi ?\" en Côte d\'Ivoire ?', 'Salutation très populaire chez les jeunes ivoiriens', 'facile', 'single_choice', 5, 20, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(18, 16, 'Que veut dire \"Yako\" ?', 'Expression de compassion très utilisée', 'facile', 'single_choice', 5, 15, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(19, 16, '\"Dêh\" est une interjection qui exprime quoi ?', 'Exclamation typiquement ivoirienne', 'facile', 'single_choice', 5, 15, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(20, 17, 'Le Dioula est principalement parlé dans quelle région ?', 'Langue véhiculaire du nord de la Côte d\'Ivoire', 'moyen', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(21, 17, 'Quelle est la langue majoritaire dans la région du centre ?', 'Langue parlée dans la région de Bouaké', 'moyen', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(22, 26, 'Qu\'est-ce qu\'un \"Gbaka\" ?', 'Moyen de transport très populaire à Abidjan', 'facile', 'single_choice', 5, 20, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(23, 26, 'Comment appelle-t-on les taxis collectifs en brousse ?', 'Transport interurbain en Côte d\'Ivoire', 'facile', 'single_choice', 5, 18, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(24, 27, 'Quel est le plus grand marché d\'Abidjan ?', 'Marché emblématique de la capitale économique', 'moyen', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(25, 27, 'Dans quel quartier se trouve le marché de Cocody ?', 'Localisation de ce marché populaire', 'moyen', 'single_choice', 10, 25, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(26, 21, 'La Fête de l\'Igname est célébrée par quel peuple ?', 'Célébration des nouvelles récoltes', 'moyen', 'single_choice', 15, 30, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(27, 21, 'Quand a lieu généralement la fête de Pâques chez les Agni ?', 'Période de célébration traditionnelle', 'difficile', 'single_choice', 20, 35, 0, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27', NULL),
(49, 51, 'a', 'Un polynôme est une somme de termes de la forme a*x^n', 'difficile', 'multiple_choice', 5, 30, 0, 1, '2025-10-10 11:12:51', '2025-10-10 11:12:51', NULL),
(50, 51, 'b', 'Un polynôme est une somme de termes de la forme a*x^n', 'difficile', 'multiple_choice', 5, 30, 0, 1, '2025-10-10 11:12:51', '2025-10-10 11:12:51', NULL),
(51, 51, 'a', 'Un polynôme est une somme de termes de la forme a*x^n', 'difficile', 'multiple_choice', 5, 30, 0, 1, '2025-10-10 11:17:14', '2025-10-10 11:17:14', NULL),
(52, 51, 'b', 'Un polynôme est une somme de termes de la forme a*x^n', 'difficile', 'multiple_choice', 5, 30, 0, 1, '2025-10-10 11:17:14', '2025-10-10 11:17:14', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `quiz_sub_thematics`
--

CREATE TABLE `quiz_sub_thematics` (
  `sub_thematic_id` int(11) NOT NULL,
  `thematic_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `difficulty_level` enum('facile','moyen','difficile') DEFAULT 'moyen',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_sub_thematics`
--

INSERT INTO `quiz_sub_thematics` (`sub_thematic_id`, `thematic_id`, `title`, `description`, `difficulty_level`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Coupé-Décalé', 'Le mouvement musical né dans la diaspora ivoirienne', 'facile', 0, 1, '2025-09-25 07:16:27', '2025-10-09 09:24:56'),
(2, 1, 'Zouglou', 'Musique universitaire et contestataire des années 90', 'moyen', 1, 2, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(3, 1, 'Reggae ivoirien', 'Alpha Blondy et la scène reggae locale', 'facile', 1, 3, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(4, 1, 'Musique traditionnelle', 'Instruments et rythmes ancestraux des ethnies', 'difficile', 1, 4, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(5, 1, 'Variétés modernes', 'Pop, R&B et nouvelles tendances musicales', 'facile', 1, 5, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(6, 2, 'Plats principaux', 'Attiéké, Foutou, Kedjenou et spécialités régionales', 'facile', 1, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(7, 2, 'Ingrédients locaux', 'Produits du terroir et épices traditionnels', 'moyen', 1, 2, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(8, 2, 'Boissons traditionnelles', 'Bangui, Bissap, jus locaux et rafraîchissements', 'facile', 1, 3, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(9, 2, 'Snacks et encas', 'Garba, Alloco, Beignets et petites collations', 'facile', 1, 4, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(10, 2, 'Cuisine de fête', 'Mets préparés lors des grandes occasions', 'moyen', 1, 5, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(11, 3, 'Football national', 'Les Éléphants de Côte d\'Ivoire et leurs exploits', 'facile', 1, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(12, 3, 'Championnat local', 'Ligue 1 ivoirienne et clubs emblématiques', 'moyen', 1, 2, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(13, 3, 'Athlétisme', 'Champions ivoiriens en course et disciplines', 'moyen', 1, 3, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(14, 3, 'Sports traditionnels', 'Lutte, jeux ancestraux et sports locaux', 'difficile', 1, 4, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(15, 3, 'Infrastructures', 'Stades, complexes sportifs du pays', 'moyen', 1, 5, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(16, 4, 'Français ivoirien', 'Particularités et spécificités du français local', 'facile', 1, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(17, 4, 'Langues nationales', 'Baoulé, Dioula, Bété, Sénoufo et autres', 'moyen', 1, 2, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(18, 4, 'Expressions populaires', 'Argot, Nouchi et langage de la rue', 'facile', 1, 3, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(19, 4, 'Proverbes traditionnels', 'Sagesse ancestrale et dictons populaires', 'difficile', 1, 4, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(20, 4, 'Littérature ivoirienne', 'Auteurs célèbres et œuvres emblématiques', 'difficile', 1, 5, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(21, 5, 'Fêtes traditionnelles', 'Cérémonies, rituels et célébrations ancestrales', 'moyen', 1, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(22, 5, 'Masques et art', 'Sculptures, masques Dan, Baoulé et artisanat', 'difficile', 1, 2, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(23, 5, 'Danses traditionnelles', 'Rythmes et chorégraphies des différentes ethnies', 'moyen', 1, 3, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(24, 5, 'Cinéma ivoirien', 'Réalisateurs, acteurs et productions locales', 'moyen', 1, 4, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(25, 5, 'Patrimoine historique', 'Sites, monuments et lieux emblématiques', 'difficile', 1, 5, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(26, 6, 'Transport urbain', 'Gbaka, Wôrô-wôrô et moyens de déplacement', 'facile', 1, 1, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(27, 6, 'Marchés et commerce', 'Grands marchés, commerce et vie économique', 'facile', 1, 2, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(28, 6, 'Habitat et architecture', 'Types de logements et constructions locales', 'moyen', 1, 3, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(29, 6, 'Coutumes sociales', 'Savoir-vivre, politesse et traditions sociales', 'moyen', 1, 4, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(30, 6, 'Éducation et jeunesse', 'Système scolaire et vie des jeunes', 'moyen', 1, 5, '2025-09-25 07:16:27', '2025-09-25 07:16:27'),
(51, 30, 'Algèbre', 'Les bases de l\'algèbre', 'difficile', 1, 1, '2025-10-10 11:12:51', '2025-10-10 11:12:51');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_thematics`
--

CREATE TABLE `quiz_thematics` (
  `thematic_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `icon_url` varchar(500) DEFAULT NULL,
  `color_code` varchar(7) DEFAULT '#6366f1',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_thematics`
--

INSERT INTO `quiz_thematics` (`thematic_id`, `title`, `description`, `icon_url`, `color_code`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Musique', 'Musique ivoirienne : Coupé-décalé, Zouglou, Reggae et artistes locau', '/uploads/thematics/icon-1759965263080.png', '#1eff8e', 1, NULL, '2025-09-25 07:16:27', '2025-10-09 09:21:08'),
(2, 'Gastronomie', 'Spécialités culinaires : Attiéké, Foutou, Kedjenou et saveurs ivoiriennes', '/uploads/thematics/icon-1759092471333.svg', '#ff6a00', NULL, 1, '2025-09-25 07:16:27', '2025-10-08 23:55:36'),
(3, 'Sport', 'Football, athlétisme et champions ivoiriens sur la scène internationale', '/uploads/thematics/icon-1759092631224.svg', '#4facfe', 1, NULL, '2025-09-25 07:16:27', '2025-10-09 00:13:16'),
(4, 'Langue', 'Français ivoirien, langues nationales et expressions populaires', '/uploads/thematics/icon-1759093811272.svg', '#febe29', 1, NULL, '2025-09-25 07:16:27', '2025-10-09 00:13:11'),
(5, 'Culture', 'Traditions, masques, fêtes et patrimoine culturel ivoirien', '/uploads/thematics/icon-1759093116887.svg', '#8e2de2', 1, 5, '2025-09-25 07:16:27', '2025-09-28 22:47:21'),
(6, 'Vie quotidienne', 'Transport, marchés, coutumes et réalités du quotidien ivoirien', '/uploads/thematics/icon-1759093380227.svg', '#ff512f', 1, 1, '2025-09-25 07:16:27', '2025-10-08 23:05:23');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_user_achievements`
--

CREATE TABLE `quiz_user_achievements` (
  `user_achievement_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `earned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_user_achievements`
--

INSERT INTO `quiz_user_achievements` (`user_achievement_id`, `user_id`, `achievement_id`, `earned_at`) VALUES
(1, 1, 1, '2025-09-25 07:16:28'),
(2, 1, 2, '2025-09-25 07:16:28'),
(3, 1, 4, '2025-09-25 07:16:28'),
(4, 1, 5, '2025-09-25 07:16:28'),
(5, 1, 9, '2025-09-25 07:16:28'),
(6, 1, 11, '2025-09-25 07:16:28'),
(7, 2, 1, '2025-09-25 07:16:28'),
(8, 2, 2, '2025-09-25 07:16:28'),
(9, 2, 8, '2025-09-25 07:16:28'),
(10, 2, 11, '2025-09-25 07:16:28'),
(11, 3, 1, '2025-09-25 07:16:28'),
(12, 3, 2, '2025-09-25 07:16:28'),
(13, 3, 3, '2025-09-25 07:16:28'),
(14, 3, 9, '2025-09-25 07:16:28'),
(15, 3, 11, '2025-09-25 07:16:28'),
(16, 4, 1, '2025-09-25 07:16:28'),
(17, 4, 2, '2025-09-25 07:16:28'),
(18, 4, 4, '2025-09-25 07:16:28'),
(19, 4, 9, '2025-09-25 07:16:28'),
(20, 4, 11, '2025-09-25 07:16:28'),
(21, 5, 1, '2025-09-25 07:16:28'),
(22, 5, 2, '2025-09-25 07:16:28'),
(23, 5, 6, '2025-09-25 07:16:28'),
(24, 5, 11, '2025-09-25 07:16:28'),
(25, 6, 1, '2025-09-25 07:16:28'),
(26, 6, 2, '2025-09-25 07:16:28'),
(27, 6, 7, '2025-09-25 07:16:28'),
(28, 6, 9, '2025-09-25 07:16:28'),
(29, 6, 11, '2025-09-25 07:16:28'),
(30, 7, 1, '2025-09-25 07:16:28'),
(31, 7, 2, '2025-09-25 07:16:28'),
(32, 7, 5, '2025-09-25 07:16:28'),
(33, 7, 9, '2025-09-25 07:16:28'),
(34, 7, 11, '2025-09-25 07:16:28'),
(35, 8, 1, '2025-09-25 07:16:28'),
(36, 8, 2, '2025-09-25 07:16:28'),
(37, 8, 4, '2025-09-25 07:16:28'),
(38, 8, 11, '2025-09-25 07:16:28'),
(39, 9, 1, '2025-09-25 07:16:28'),
(40, 9, 2, '2025-09-25 07:16:28'),
(41, 9, 6, '2025-09-25 07:16:28'),
(42, 9, 7, '2025-09-25 07:16:28'),
(43, 9, 11, '2025-09-25 07:16:28'),
(44, 10, 1, '2025-09-25 07:16:28'),
(45, 10, 2, '2025-09-25 07:16:28'),
(46, 10, 6, '2025-09-25 07:16:28'),
(47, 10, 9, '2025-09-25 07:16:28'),
(48, 10, 12, '2025-09-25 07:16:28'),
(49, 10, 11, '2025-09-25 07:16:28');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_user_sessions`
--

CREATE TABLE `quiz_user_sessions` (
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `thematic_id` int(11) NOT NULL,
  `sub_thematic_id` int(11) DEFAULT NULL,
  `current_question_index` int(11) DEFAULT '0',
  `answered_questions` json DEFAULT NULL,
  `current_score` int(11) DEFAULT '0',
  `correct_answers_count` int(11) DEFAULT '0',
  `total_questions` int(11) NOT NULL,
  `difficulty_level` enum('facile','moyen','difficile') DEFAULT NULL,
  `time_started` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_completed` tinyint(1) DEFAULT '0',
  `session_data` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_user_sessions`
--

INSERT INTO `quiz_user_sessions` (`session_id`, `user_id`, `thematic_id`, `sub_thematic_id`, `current_question_index`, `answered_questions`, `current_score`, `correct_answers_count`, `total_questions`, `difficulty_level`, `time_started`, `last_activity`, `is_completed`, `session_data`) VALUES
(1, 11, 30, 51, 2, '[{\"questionId\": 2, \"selectedOption\": 1}, {\"questionId\": 3, \"selectedOption\": 1}]', 1, 0, 4, NULL, '2025-10-10 11:33:16', '2025-10-10 11:35:34', 1, '{\"subTitle\": \"Algèbre\", \"thematicTitle\": \"Mathématiques\"}'),
(2, 11, 30, 51, 2, '[{\"questionId\": 3, \"selectedOption\": 1}]', 1, 0, 4, NULL, '2025-10-10 11:33:16', '2025-10-10 11:34:10', 1, '{\"subTitle\": \"Algèbre\", \"thematicTitle\": \"Mathématiques\"}'),
(3, 11, 1, NULL, 2, '[{\"questionId\": 2, \"selectedOption\": 2}, {\"questionId\": 3, \"selectedOption\": 2}]', 2, 1, 3, NULL, '2025-10-10 11:35:56', '2025-10-10 11:50:46', 1, '{\"subTitle\": \"Coupé-Décalé\", \"thematicTitle\": \"Musique\"}'),
(4, 11, 1, NULL, 2, '[{\"questionId\": 1, \"selectedOption\": 1}, {\"questionId\": 2, \"selectedOption\": 1}, {\"questionId\": 3, \"selectedOption\": 1}]', 1, 1, 3, NULL, '2025-10-10 11:35:56', '2025-10-10 11:57:53', 1, '{\"subTitle\": \"Coupé-Décalé\", \"thematicTitle\": \"Musique\"}'),
(5, 11, 30, 51, 3, '[]', 0, 0, 4, NULL, '2025-10-10 12:00:42', '2025-10-10 12:10:29', 1, '{\"subTitle\": \"Algèbre\", \"thematicTitle\": \"Mathématiques\"}'),
(6, 11, 1, NULL, 3, '[{\"questionId\": 49, \"selectedOption\": 1}, {\"questionId\": 50, \"selectedOption\": 2}, {\"questionId\": 51, \"selectedOption\": 3}]', 1, 1, 3, NULL, '2025-10-10 12:10:44', '2025-10-10 12:13:58', 1, '{\"subTitle\": \"Coupé-Décalé\", \"thematicTitle\": \"Musique\"}'),
(7, 11, 1, NULL, 2, '[{\"questionId\": 1, \"selectedOption\": 1}, {\"questionId\": 2, \"selectedOption\": 2}]', 2, 2, 3, NULL, '2025-10-10 12:10:44', '2025-10-10 12:10:51', 1, '{\"subTitle\": \"Coupé-Décalé\", \"thematicTitle\": \"Musique\"}'),
(8, 11, 30, 51, 1, '[]', 1, 0, 4, NULL, '2025-10-10 12:14:18', '2026-02-09 21:54:34', 0, '{\"subTitle\": \"Algèbre\", \"thematicTitle\": \"Mathématiques\"}'),
(9, 11, 30, 51, 0, NULL, 0, 0, 4, NULL, '2025-10-10 12:14:18', '2025-10-10 12:14:18', 0, '{\"subTitle\": \"Algèbre\", \"thematicTitle\": \"Mathématiques\"}');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_user_totals`
--

CREATE TABLE `quiz_user_totals` (
  `total_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_points` int(11) DEFAULT '0',
  `total_games_played` int(11) DEFAULT '0',
  `total_achievements` int(11) DEFAULT '0',
  `average_completion` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_user_totals`
--

INSERT INTO `quiz_user_totals` (`total_id`, `user_id`, `total_points`, `total_games_played`, `total_achievements`, `average_completion`, `created_at`, `updated_at`) VALUES
(1, 2, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(2, 4, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(3, 5, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(4, 6, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(5, 7, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(6, 8, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(7, 9, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(8, 10, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(9, 12, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(10, 1, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(11, 11, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10'),
(12, 3, 0, 0, 0, '0.00', '2025-09-27 10:37:10', '2025-09-27 10:37:10');

-- --------------------------------------------------------

--
-- Structure de la table `user_feedbacks`
--

CREATE TABLE `user_feedbacks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `user_feedbacks`
--

INSERT INTO `user_feedbacks` (`id`, `user_id`, `reason`, `comment`, `created_at`) VALUES
(2, 11, 'prix', '', '2025-10-01 00:10:58'),
(3, 20, 'utilite', 'hbghg', '2025-10-02 20:11:23'),
(4, 1, 'admin_remove', 'admin_remove', '2025-10-06 21:52:05'),
(5, 31, 'admin_remove', 'admin_remove', '2025-10-06 21:52:05'),
(6, 31, 'admin_remove', '', '2025-10-06 23:38:56'),
(7, 31, 'admin_remove', '', '2025-10-06 23:39:22'),
(8, 36, 'admin_remove', '', '2026-01-31 22:16:27'),
(9, 36, 'admin_remove', '', '2026-01-31 22:16:46'),
(10, 36, 'admin_remove', '', '2026-01-31 22:19:11'),
(11, 36, 'admin_remove', 'admin_remove', '2026-01-31 22:19:20'),
(12, 38, 'admin_remove', '', '2026-01-31 22:20:28'),
(13, 38, 'admin_remove', 'admin_remove', '2026-01-31 22:20:46'),
(14, 39, 'admin_remove', '', '2026-01-31 22:25:26'),
(15, 38, 'admin_remove', '', '2026-01-31 22:31:11'),
(16, 36, 'admin_remove', 'admin_remove', '2026-01-31 23:08:02'),
(16, 39, 'admin_remove', 'admin_remove', '2026-01-31 23:08:02'),
(16, 37, 'admin_remove', 'admin_remove', '2026-01-31 23:08:02'),
(16, 38, 'admin_remove', 'admin_remove', '2026-01-31 23:08:02'),
(17, 36, 'admin_remove', '', '2026-01-31 23:31:03'),
(18, 36, 'admin_remove', '', '2026-01-31 23:33:16');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `user_points`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `user_points` (
`user_id` int(11)
,`name` varchar(100)
,`first_name` varchar(100)
,`full_name` varchar(201)
,`email` varchar(150)
,`total_points_games` decimal(32,0)
,`total_points_achievements` decimal(32,0)
,`total_points` decimal(33,0)
,`total_games_played` bigint(21)
,`total_achievements` bigint(21)
,`average_completion` decimal(9,6)
);

-- --------------------------------------------------------

--
-- Structure de la table `user_totals_link`
--

CREATE TABLE `user_totals_link` (
  `link_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la vue `user_points`
--
DROP TABLE IF EXISTS `user_points`;
DROP VIEW IF EXISTS `user_points`;

CREATE VIEW `user_points` AS
SELECT
  `u`.`user_id` AS `user_id`,
  `u`.`name` AS `name`,
  `u`.`first_name` AS `first_name`,
  concat(`u`.`first_name`, ' ', `u`.`name`) AS `full_name`,
  `u`.`email` AS `email`,
  coalesce(sum(`gh`.`score`), 0) AS `total_points_games`,
  coalesce(sum(`a`.`points_reward`), 0) AS `total_points_achievements`,
  (coalesce(sum(`gh`.`score`), 0) + coalesce(sum(`a`.`points_reward`), 0)) AS `total_points`,
  count(distinct `gh`.`history_id`) AS `total_games_played`,
  count(distinct `ua`.`achievement_id`) AS `total_achievements`,
  coalesce(avg(`gh`.`completion_percentage`), 0) AS `average_completion`
FROM (((`funquiz_users` `u`
  left join `quiz_game_history` `gh` on ((`u`.`user_id` = `gh`.`user_id`)))
  left join `quiz_user_achievements` `ua` on ((`u`.`user_id` = `ua`.`user_id`)))
  left join `achievements` `a` on ((`ua`.`achievement_id` = `a`.`achievement_id`)))
WHERE (`u`.`is_active` = TRUE)
GROUP BY `u`.`user_id`, `u`.`name`, `u`.`first_name`, `u`.`email`;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `funquiz_comments`
--
ALTER TABLE `funquiz_comments`
  ADD PRIMARY KEY (`comment_id`);

--
-- Index pour la table `funquiz_newsletter`
--
ALTER TABLE `funquiz_newsletter`
  ADD PRIMARY KEY (`newsletter_id`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Index pour la table `funquiz_private_messages`
--
ALTER TABLE `funquiz_private_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_receiver` (`receiver_id`),
  ADD KEY `idx_pair` (`sender_id`,`receiver_id`);

--
-- Index pour la table `publicite`
--
ALTER TABLE `publicite`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `funquiz_comments`
--
ALTER TABLE `funquiz_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `funquiz_newsletter`
--
ALTER TABLE `funquiz_newsletter`
  MODIFY `newsletter_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `funquiz_private_messages`
--
ALTER TABLE `funquiz_private_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `publicite`
--
ALTER TABLE `publicite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
