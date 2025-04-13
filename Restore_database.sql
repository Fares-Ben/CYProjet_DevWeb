CREATE DATABASE IF NOT EXISTS smart_ecole;
USE smart_ecole;

-- Table users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  prenom VARCHAR(50) NOT NULL,
  date_naissance DATE NOT NULL,
  fonction VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  pseudo VARCHAR(50) NOT NULL UNIQUE,
  photo VARCHAR(50),
  niveau VARCHAR(10) NOT NULL,
  points INT NOT NULL DEFAULT 0,
  last_connexion DATETIME,
  nb_connexions INT NOT NULL DEFAULT 0,
  nb_actions INT NOT NULL DEFAULT 0,
  validated TINYINT(1) NOT NULL DEFAULT 0,
  validation_token VARCHAR(255),
  token_expiration DATETIME,
  theme_prefere VARCHAR(10) NOT NULL DEFAULT 'light',
  date_inscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  email_verified TINYINT(1) NOT NULL DEFAULT 0

);

-- Table smart_devices
CREATE TABLE smart_devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  location VARCHAR(50) NOT NULL,
  etat VARCHAR(20) NOT NULL,
  consommation INT,
  Date_derniere_activite DATE,
  Date_debut_maintenance DATE,
  Date_fin_maintenance DATE
);

-- Table users_activity
CREATE TABLE Users_activity (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ID_user_changeur INT NOT NULL,
  ID_user_modified INT NOT NULL,
  type VARCHAR(255) NOT NULL,
  ancienne_donnee TEXT,
  nouvelle_donnee TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table objects_activity
CREATE TABLE objects_activity (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ID_user_changeur INT NOT NULL,
  ID_object_modified INT NOT NULL,
  type VARCHAR(255) NOT NULL,
  ancienne_donnee TEXT,
  nouvelle_donnee TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table announcements
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  urgent BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table events
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(100) NOT NULL
);

-- Inserting some initial data

-- Users (with example values based on your description)
INSERT INTO users (nom, prenom, date_naissance, fonction, email, password, pseudo, photo, niveau, points, last_connexion, nb_connexions, nb_actions, validated, validation_token, token_expiration, theme_prefere, email_verified)
VALUES
  ('Martin', 'Jeanettee', '1995-02-10', 'Directeur', 'jean.martin@ecole.fr', '$2b$10$IOq/NB1/UAoIX5Thif8AnuakpeJ/Vkki1Rhn7BcoTvIXN8.2A9Fmq', 'e-jMartine', 'jean.jpg', 'simple', 98, '2025-04-08 00:19:51', 0, 0, 1, NULL, NULL, 'light', 1),
  ('Lemoine', 'Sophiesss', '2025-04-18', 'Professeur', 'sophie.lemoine@ecole.fr', '$2b$10$/ErDgUDiMtEm.RGlIt4H9.z0IlgZL5KBmF7W8GUyQYlzW6b73YW.m', 'e-sLemoiness', 'sophie.jpg', 'complexe', 4, '2002-04-11 00:00:00', 0, 0, 1, NULL, NULL, 'light', 1),
  ('Durands', 'Paul', '1994-09-19', 'Directeur', 'paul.durand@ecole.fr', '$2b$10$ZtxXldgd6erirxQOLr5LbeVQ.WkGt1h6CLjf36uD4xq0xjxNHMGIK', 'e-pDurand', 'paul.jpg', 'admin', 6, '2025-04-09 16:33:53', 0, 0, 1, NULL, NULL, 'light', 1),
  ('Moreau', 'Emma', '2016-09-04', 'Eleve', 'emma.moreau@ecole.fr', '$2b$10$p/Ox8UnD42WQg64Zwwa9cONLUoeSKoTJybWDDPVz8gyQC66P8PZMK', 'e-eMoreau', 'emma.jpg', 'admin', 3, NULL, 0, 0, 1, NULL, NULL, 'light', 1),
  ('Petit', 'Léo', '2017-05-28', 'Personnel', 'leo.petit@ecole.fr', '$2b$10$Agq2CuL4FC5.MZYqWly1Qeh1OhOd2r/hgGytfGFodFC718iH.wmaa', 'e-lPetit', 'leo.jpg', 'simple', 0, '2025-04-09 14:49:43', 0, 0, 1, NULL, NULL, 'light', 1);

-- Smart Devices (example devices)
INSERT INTO smart_devices (name, type, location, etat, consommation, Date_derniere_activite)
VALUES
  ('Tableau interactif B12', 'tableau', 'Salle B12', 'actif', NULL, NULL),
  ('Climatiseur Cour', 'climatisation', 'Cour principale', 'maintenance', NULL, NULL),
  ('Imprimante Réseau A', 'imprimante', 'Salle des profs', 'actif', NULL, NULL),
  ('Caméra Hall', 'caméra', 'Entrée principale', 'actif', NULL, NULL),
  ('Badgeuse Personnel', 'badgeuse', 'Entrée profs', 'actif', NULL, NULL);

-- Announcements
INSERT INTO announcements (title, content, urgent, date, author, created_by)
VALUES 
('Réunion pédagogique', 'Une réunion est prévue jeudi à 14h en salle B.', FALSE, '2025-04-14', 'Admin', 1),
('Incendie simulé', 'Un exercice incendie aura lieu lundi matin à 10h.', TRUE, '2025-04-15', 'Admin', 1),
('Nouveau matériel disponible', 'Des ordinateurs portables sont disponibles en salle 204.', FALSE, '2025-04-13', 'Admin', 1);


-- Events
INSERT INTO events (title, description, date, start_time, end_time, location, participants, created_by)
VALUES
(
  'Réunion Parents-Profs',
  'Une réunion pour discuter des progrès des élèves.',
  '2025-04-15',
  '17:00:00',
  '19:00:00',
  'Salle 101',
  'Parents, Enseignants',
  1
),
(
  'Journée Sportive',
  'Tournoi interclasses avec plusieurs sports.',
  '2025-04-20',
  '09:00:00',
  '16:00:00',
  'Terrain principal',
  'Tous',
  2
),
(
  'Conférence IA & Éducation',
  'Présentation des dernières avancées en intelligence artificielle appliquées à l\'éducation.',
  '2025-04-22',
  '14:00:00',
  '16:00:00',
  'Amphi A',
  'Professeurs',
  3
),
(
  'Atelier Écologie',
  'Activité pratique pour sensibiliser les élèves à l\'environnement.',
  '2025-04-25',
  '10:00:00',
  '12:00:00',
  'Jardin scolaire',
  'Élèves',
  1
),
(
  'Spectacle de fin d\'année',
  'Spectacle préparé par les élèves de toutes les classes.',
  '2025-06-15',
  '18:30:00',
  '21:00:00',
  'Salle des fêtes',
  'Tous',
  4
);


-- Ajout des activités des utilisateurs
INSERT INTO users_activity (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date)
VALUES 
(4, 3, 'MODIFICATION NOM', 'Lemoine', 'Lemoiness', '2025-04-09 12:30:31'),
(4, 3, 'MODIFICATION EMAIL', 'sophie.lemoine@ecole.fr', 'sophie.lemoine@ecole.frs', '2025-04-09 12:35:32'),
(4, 3, 'MODIFICATION PSEUDO', 'e-sLemoine', 'e-sLemoines', '2025-04-09 12:35:41'),
(4, 2, 'MODIFICATION POINTS', '96', '94', '2025-04-09 12:31:02'),
(4, 4, 'MODIFICATION STATUT VALIDATION', '1', '0', '2025-04-09 12:34:55'),
(4, 4, 'MODIFICATION NOM', 'Durand', 'Durands', '2025-04-09 12:35:22');

-- Ajout des appareils intelligents dans l'école
INSERT INTO smart_devices (name, type, location, etat, consommation, Date_derniere_activite)
VALUES 
('Tableau interactif B12', 'tableau', 'Salle B12', 'actif', NULL, NULL),
('Climatiseur Cour', 'climatisation', 'Cour principale', 'maintenance', NULL, NULL),
('Imprimante Réseau A', 'imprimante', 'Salle des profs', 'actif', NULL, NULL),
('Caméra Hall', 'caméra', 'Entrée principale', 'actif', NULL, NULL),
('Badgeuse Personnel', 'badgeuse', 'Entrée profs', 'actif', NULL, NULL),
('Alarme Incendie', 'alarme', 'Toit', 'actif', NULL, NULL),
('Switch Réseau', 'réseau', 'Salle serveurs', 'actif', NULL, NULL),
('Détecteur CO2', 'capteur', 'Classe CE2', 'actif', NULL, NULL),
('Projecteur CP', 'projecteur', 'Classe CP', 'hors service', NULL, NULL),
('Tablette Enseignant', 'tablette', 'Salle CE1', 'actif', NULL, NULL),
('Caméra Cour', 'caméra', 'Cour de récré', 'actif', NULL, NULL),
('Thermostat Salle A', 'thermostat', 'Salle A', 'actif', NULL, NULL),
('Clim Salle des profs', 'climatisation', 'Salle des profs', 'maintenance', NULL, NULL),
('Enceinte Bluetooth', 'audio', 'Salle musique', 'actif', NULL, NULL),
('Tableau interactif CM1', 'tableau', 'Salle CM1', 'actif', NULL, NULL),
('Capteur de bruit', 'capteur', 'Salle CE1', 'actif', NULL, NULL),
('Routeur Wi-Fi', 'réseau', 'Bureau Directeur', 'actif', NULL, NULL),
('Badgeuse Élèves', 'badgeuse', 'Entrée élèves', 'actif', NULL, NULL);

-- Ajout d'événements dans l'école
INSERT INTO events (title, date, location)
VALUES 
('Réunion pédagogique', '2025-04-15', 'Salle des profs'),
('Journée portes ouvertes', '2025-05-01', 'École'),
('Conférence sur l\'éducation', '2025-06-10', 'Amphithéâtre'),
('Séminaire de formation', '2025-07-20', 'Bureau directeur'),
('Concours de science', '2025-08-05', 'Salle CM1');

-- Ajout des annonces
INSERT INTO announcements (title, content, author_id, created_at, priority)
VALUES 
('Rappel sur les dates de vacances', 'Les vacances de printemps commencent le 10 avril et se terminent le 25 avril. N\'oubliez pas de remettre vos devoirs.', 4, '2025-04-08 12:00:00', 'medium'),
('Réunion d\'information pour les parents', 'Il y aura une réunion d\'information pour les parents le 15 avril à 18h dans la salle des profs. Tous les parents sont invités.', 4, '2025-04-09 10:00:00', 'high'),
('Événement sportif', 'Un événement sportif aura lieu le 20 avril. Les élèves sont invités à participer aux activités sportives.', 3, '2025-04-09 14:00:00', 'low'),
('Mise à jour de la plateforme', 'La plateforme en ligne sera mise à jour le 10 avril. Veuillez vérifier vos informations après la mise à jour.', 4, '2025-04-08 18:00:00', 'medium');

-- Table classes
CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(10) NOT NULL,
  teacher_id INT,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Insertion de données initiales dans la table classes
INSERT INTO classes (name, teacher_id)
VALUES
  ('CP', 1),
  ('CE1', 2),
  ('CE2', 3),
  ('CM1', 1),
  ('CM2', 2);
