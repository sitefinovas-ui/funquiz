-- Migration: table de liaison thématiques <-> pays (many-to-many)
-- À exécuter une seule fois sur la base de données

CREATE TABLE IF NOT EXISTS `quiz_thematic_countries` (
  `thematic_id` int(11) NOT NULL,
  `country_code` varchar(10) NOT NULL,
  PRIMARY KEY (`thematic_id`, `country_code`),
  CONSTRAINT `fk_tc_thematic` FOREIGN KEY (`thematic_id`)
    REFERENCES `quiz_thematics` (`thematic_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migrer les données existantes (country_code unique → table de liaison)
INSERT IGNORE INTO `quiz_thematic_countries` (`thematic_id`, `country_code`)
SELECT `thematic_id`, `country_code`
FROM `quiz_thematics`
WHERE `country_code` IS NOT NULL AND `country_code` != '';
