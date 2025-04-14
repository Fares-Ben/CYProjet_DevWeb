-- MySQL dump 10.13  Distrib 9.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_ecole
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `urgent` tinyint(1) DEFAULT '0',
  `date` date NOT NULL,
  `author` varchar(100) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'Réunion pédagogique','qsdfq',0,'2025-04-09','Admin',1,'2025-04-13 16:45:22'),(2,'Incendie simulé','Un exercice incendie aura lieu lundi matin à 10h.',0,'2025-04-15','Admin',1,'2025-04-13 16:45:22'),(3,'Nouveau matériel disponible','Des ordinateurs portables sont disponibles en salle 204.',0,'2025-04-10','Admin',1,'2025-04-13 16:45:22'),(4,'qfsfd','qdsfq',1,'2025-04-09','Admin',58,'2025-04-13 16:45:36'),(5,'rqsgfs','ouui ouoiiii',1,'2025-04-09','Admin',58,'2025-04-13 16:45:55'),(6,'dinguerie','vous etes chaud ?',1,'2025-04-12','Admin',3,'2025-04-13 19:26:04'),(7,'okhsdlf','qfdsqsfsdq',1,'2025-04-13','Admin',3,'2025-04-13 21:54:06');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(10) NOT NULL,
  `teacher_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'CP',1),(2,'CE1',2),(3,'CE2',3),(4,'CM1',1),(5,'CM2',2);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `participants` varchar(255) DEFAULT 'Tous',
  `created_by` int DEFAULT NULL,
  `location` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_created_by` (`created_by`),
  CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (8,'Réunion Parents-Profs','Une réunion pour discuter des progrès des élèves.','2025-04-15','17:00:00','19:00:00','Parents, Enseignants',1,'Salle 101'),(9,'Journée Sportive','Tournoi interclasses avec plusieurs sports.','2025-04-20','09:00:00','16:00:00','Tous',2,'Terrain principal'),(10,'Conférence IA & Éducation','Présentation des dernières avancées en intelligence artificielle appliquées à l\'éducation.','2025-04-22','14:00:00','16:00:00','Professeurs',3,'Amphi A'),(11,'Atelier Écologie','Activité pratique pour sensibiliser les élèves à l\'environnement.','2025-04-25','10:00:00','12:00:00','Élèves',1,'Jardin scolaire'),(12,'Spectacle de fin d\'année','Spectacle préparé par les élèves de toutes les classes.','2025-06-15','18:30:00','21:00:00','Tous',4,'Salle des fêtes'),(13,'salla','uyhbqsfhdjfvcsq','2025-04-09','08:02:00','21:00:00','maisonnn',58,'Cour principale'),(14,'dsqfqsdfddsq','','2025-04-13','08:00:00','17:00:00','Tous',58,'dsqfdqsfd'),(15,'fw','','2025-04-13','08:00:00','17:00:00','Tous',58,'wfgv'),(16,'reunion parent-prof','','2025-04-16','12:00:00','17:00:00','Classe 3èmeB',3,'salle B11'),(17,'dsq','fqsdf','2025-04-13','08:00:00','17:00:00','qsdf',63,'dqsfqsd'),(18,'fqdfs','fqsd','2025-04-13','08:00:00','17:00:00','Tous',64,'dfq');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objects_activity`
--

DROP TABLE IF EXISTS `objects_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objects_activity` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ID_user_changeur` int NOT NULL,
  `ID_object_modified` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `ancienne_donnee` text,
  `nouvelle_donnee` text,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objects_activity`
--

LOCK TABLES `objects_activity` WRITE;
/*!40000 ALTER TABLE `objects_activity` DISABLE KEYS */;
INSERT INTO `objects_activity` VALUES (1,3,1,'MODIFICATION ETAT','maintenance','actif','2025-04-13 15:16:20'),(2,3,3,'MODIFICATION ETAT','maintenance','actif','2025-04-13 15:16:24'),(3,3,1,'MODIFICATION LOCATION','Salle B12','dzdzq','2025-04-13 15:16:28'),(4,3,1,'MODIFICATION CONSOMMATION','4','4.3','2025-04-13 15:16:34'),(5,3,1,'MODIFICATION CONSOMMATION','4','20','2025-04-13 15:16:41'),(6,3,1,'MODIFICATION ETAT','actif','inactif','2025-04-13 15:17:38'),(7,3,1,'SUPPRESSION APPAREIL','Tabb','Supprimé','2025-04-13 15:18:03'),(8,3,3,'MODIFICATION NAME','Imprimante Réseau A','dsqfdsfq','2025-04-13 16:01:34'),(9,3,13,'MODIFICATION ETAT','maintenance','inactif','2025-04-13 16:01:41'),(10,58,30,'AJOUT NOUVEAU APPAREIL','0','nouveau appreil','2025-04-13 16:31:17'),(11,58,9,'SUPPRESSION APPAREIL','Caméra Hall','Supprimé','2025-04-13 16:32:55'),(12,58,26,'SUPPRESSION APPAREIL','','Supprimé','2025-04-13 16:33:01'),(13,3,8,'MODIFICATION ETAT','actif','inactif','2025-04-13 21:53:08'),(14,3,8,'MODIFICATION ETAT','inactif','maintenance','2025-04-13 21:53:12'),(15,3,8,'MODIFICATION TYPE','imprimante','climatisation','2025-04-13 21:53:15'),(16,3,7,'MODIFICATION NAME','Climatiseur Cour','Climatiseur Coursss','2025-04-13 21:53:19'),(17,3,7,'MODIFICATION LOCATION','Cour principale','Cour principalesqsq','2025-04-13 21:53:22'),(18,3,7,'MODIFICATION CONSOMMATION','0','20','2025-04-13 21:53:30'),(19,3,7,'SUPPRESSION APPAREIL','Climatiseur Coursss','Supprimé','2025-04-13 21:53:36'),(20,63,27,'SUPPRESSION APPAREIL','sasa','Supprimé','2025-04-13 22:18:41'),(21,63,30,'SUPPRESSION APPAREIL','rstd','Supprimé','2025-04-13 22:18:50'),(22,63,29,'SUPPRESSION APPAREIL','rstd','Supprimé','2025-04-13 22:18:53'),(23,63,28,'SUPPRESSION APPAREIL','rstd','Supprimé','2025-04-13 22:18:55'),(24,63,5,'MODIFICATION ETAT','actif','maintenance','2025-04-13 22:22:21'),(25,63,5,'MODIFICATION ETAT','maintenance','inactif','2025-04-13 22:22:25'),(26,63,5,'MODIFICATION ETAT','inactif','actif','2025-04-13 22:22:28'),(27,63,8,'MODIFICATION ETAT','maintenance','actif','2025-04-13 22:24:41'),(28,63,13,'SUPPRESSION APPAREIL','Détecteur CO2','Supprimé','2025-04-13 22:24:46'),(29,63,3,'MODIFICATION NAME','dsqfdsfq','dsqfdsfqdfqs','2025-04-13 22:43:29'),(30,63,3,'SUPPRESSION APPAREIL','dsqfdsfqdfqs','Supprimé','2025-04-13 22:43:30'),(31,64,5,'MODIFICATION ETAT','actif','inactif','2025-04-13 22:53:20'),(32,64,5,'MODIFICATION ETAT','inactif','maintenance','2025-04-13 22:53:23'),(33,64,5,'MODIFICATION ETAT','maintenance','actif','2025-04-13 22:53:25'),(34,64,5,'MODIFICATION ETAT','actif','inactif','2025-04-13 22:54:03'),(35,64,5,'MODIFICATION ETAT','inactif','maintenance','2025-04-13 22:54:05'),(36,64,5,'MODIFICATION ETAT','maintenance','actif','2025-04-13 22:54:09'),(37,64,5,'MODIFICATION ETAT','actif','inactif','2025-04-13 23:07:24'),(38,64,5,'MODIFICATION ETAT','inactif','maintenance','2025-04-13 23:37:57'),(39,64,5,'MODIFICATION ETAT','maintenance','actif','2025-04-13 23:38:02'),(40,3,8,'MODIFICATION CONSOMMATION',NULL,'2000','2025-04-13 23:41:56'),(41,3,1,'MODIFICATION CONSOMMATION','1800','20000','2025-04-14 00:00:07'),(42,3,1,'MODIFICATION ETAT','actif','inactif','2025-04-14 00:00:25'),(43,3,1,'MODIFICATION ETAT','inactif','actif','2025-04-14 00:00:35'),(44,3,1,'MODIFICATION CONSOMMATION','20000','2000','2025-04-14 00:00:40'),(45,3,1,'MODIFICATION ETAT','actif','inactif','2025-04-14 00:04:23'),(46,3,2,'MODIFICATION CONSOMMATION','0','20000','2025-04-14 00:04:42'),(47,3,2,'MODIFICATION CONSOMMATION','20000','0','2025-04-14 00:04:53'),(48,3,55,'AJOUT NOUVEAU APPAREIL','0','nouveau appreil','2025-04-14 00:05:29');
/*!40000 ALTER TABLE `objects_activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smart_devices`
--

DROP TABLE IF EXISTS `smart_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `smart_devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` varchar(20) NOT NULL,
  `location` varchar(50) NOT NULL,
  `etat` varchar(20) NOT NULL,
  `consommation` int DEFAULT NULL,
  `Date_derniere_activite` date DEFAULT NULL,
  `Date_debut_maintenance` date DEFAULT NULL,
  `Date_fin_maintenance` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smart_devices`
--

LOCK TABLES `smart_devices` WRITE;
/*!40000 ALTER TABLE `smart_devices` DISABLE KEYS */;
INSERT INTO `smart_devices` VALUES (1,'Climatisation Salle CE1','climatisation','Salle CE1','inactif',2000,'2025-04-13',NULL,NULL),(2,'Climatisation Salle CE2','climatisation','Salle CE2','maintenance',0,NULL,'2025-04-10','2025-04-15'),(3,'Climatisation Salle CM1','climatisation','Salle CM1','actif',2200,'2025-04-13',NULL,NULL),(4,'Tableau interactif CE1','tableau','Salle CE1','actif',180,'2025-04-12',NULL,NULL),(5,'Tableau interactif CE2','tableau','Salle CE2','actif',170,'2025-04-13',NULL,NULL),(6,'Tableau interactif CM1','tableau','Salle CM1','maintenance',0,NULL,'2025-04-11','2025-04-17'),(7,'Caméra Entrée Élèves','caméra','Entrée Élèves','actif',40,'2025-04-13',NULL,NULL),(8,'Caméra Cour','caméra','Cour de récréation','actif',35,'2025-04-13',NULL,NULL),(9,'Caméra Toit','caméra','Toit','maintenance',0,NULL,'2025-04-12','2025-04-15'),(10,'Capteur de bruit CM1','capteur','Salle CM1','actif',2,'2025-04-13',NULL,NULL),(11,'Capteur luminosité CE1','capteur','Salle CE1','actif',2,'2025-04-13',NULL,NULL),(12,'Routeur Wi-Fi Salle Serveurs','réseau','Salle Serveurs','actif',60,'2025-04-13',NULL,NULL),(13,'Routeur Wi-Fi Bureau Directeur','réseau','Bureau Directeur','maintenance',0,NULL,'2025-04-10','2025-04-14'),(14,'Badgeuse Élèves','badgeuse','Entrée Élèves','actif',15,'2025-04-13',NULL,NULL),(15,'Badgeuse Personnel','badgeuse','Entrée Professeurs','actif',18,'2025-04-13',NULL,NULL),(16,'Tablette Professeur CE2','tablette','Salle CE2','actif',45,'2025-04-13',NULL,NULL),(17,'Tablette Directeur','tablette','Bureau Directeur','maintenance',0,NULL,'2025-04-11','2025-04-16'),(18,'Projecteur Salle CM2','projecteur','Salle CM2','maintenance',0,NULL,'2025-04-10','2025-04-17'),(19,'Projecteur Salle Polyvalente','projecteur','Salle Polyvalente','actif',420,'2025-04-13',NULL,NULL),(20,'Alarme Incendie Aile Nord','alarme','Couloir Aile Nord','actif',25,'2025-04-13',NULL,NULL),(21,'Alarme Intrusion CE2','alarme','Salle CE2','actif',28,'2025-04-13',NULL,NULL),(22,'Thermostat Salle A','thermostat','Salle A','actif',4,'2025-04-13',NULL,NULL),(23,'Thermostat Salle B','thermostat','Salle B','maintenance',0,NULL,'2025-04-12','2025-04-16'),(24,'Imprimante Réseau A','imprimante','Salle des profs','actif',380,'2025-04-13',NULL,NULL),(25,'Imprimante Réseau B','imprimante','Bureau Direction','maintenance',0,NULL,'2025-04-12','2025-04-15'),(26,'Climatisation Salle CE1','climatisation','Salle CE1','actif',1850,'2025-04-13',NULL,NULL),(27,'Climatisation Salle CE2','climatisation','Salle CE2','actif',1700,'2025-04-13',NULL,NULL),(28,'Climatisation Salle CM1','climatisation','Salle CM1','maintenance',0,NULL,'2025-04-10','2025-04-15'),(29,'Climatisation Salle CM2','climatisation','Salle CM2','actif',1950,'2025-04-12',NULL,NULL),(30,'Climatisation Bureau Direction','climatisation','Bureau Directeur','actif',2000,'2025-04-13',NULL,NULL),(31,'Climatisation Salle informatique','climatisation','Salle informatique','maintenance',0,NULL,'2025-04-11','2025-04-16'),(32,'Climatisation Cantine','climatisation','Cantine','actif',2300,'2025-04-13',NULL,NULL),(33,'Climatisation Salle des profs','climatisation','Salle des profs','actif',2100,'2025-04-13',NULL,NULL),(34,'Climatisation Bibliothèque','climatisation','Bibliothèque','maintenance',0,NULL,'2025-04-12','2025-04-17'),(35,'Tableau CE1','tableau','Salle CE1','actif',190,'2025-04-13',NULL,NULL),(36,'Tableau CE2','tableau','Salle CE2','maintenance',0,NULL,'2025-04-10','2025-04-13'),(37,'Tableau CM1','tableau','Salle CM1','actif',200,'2025-04-13',NULL,NULL),(38,'Tableau CM2','tableau','Salle CM2','actif',210,'2025-04-13',NULL,NULL),(39,'Tableau Salle musique','tableau','Salle musique','actif',180,'2025-04-13',NULL,NULL),(40,'Tableau Salle anglais','tableau','Salle anglais','actif',170,'2025-04-13',NULL,NULL),(41,'Badgeuse Entrée Élèves','badgeuse','Entrée Élèves','actif',15,'2025-04-13',NULL,NULL),(42,'Badgeuse Entrée Profs','badgeuse','Entrée Professeurs','actif',18,'2025-04-13',NULL,NULL),(43,'Badgeuse Sport','badgeuse','Gymnase','actif',14,'2025-04-13',NULL,NULL),(44,'Badgeuse Réfectoire','badgeuse','Cantine','maintenance',0,NULL,'2025-04-10','2025-04-15'),(45,'Badgeuse Visiteurs','badgeuse','Accueil','actif',16,'2025-04-13',NULL,NULL),(46,'Routeur Wi-Fi Principal','réseau','Salle Serveurs','actif',60,'2025-04-13',NULL,NULL),(47,'Routeur Wi-Fi Secondaire','réseau','Bureau Directeur','maintenance',0,NULL,'2025-04-11','2025-04-16'),(48,'Routeur Wi-Fi CDI','réseau','Bibliothèque','actif',55,'2025-04-13',NULL,NULL),(49,'Routeur Gymnase','réseau','Gymnase','actif',50,'2025-04-13',NULL,NULL),(50,'Projecteur CM2','projecteur','Salle CM2','actif',400,'2025-04-13',NULL,NULL),(51,'Projecteur Salle Polyvalente','projecteur','Salle Polyvalente','maintenance',0,NULL,'2025-04-10','2025-04-17'),(52,'Projecteur Cantine','projecteur','Cantine','actif',380,'2025-04-13',NULL,NULL),(53,'Projecteur Bibliothèque','projecteur','Bibliothèque','actif',420,'2025-04-13',NULL,NULL),(54,'Projecteur Salle informatique','projecteur','Salle informatique','maintenance',0,NULL,'2025-04-11','2025-04-14'),(55,'Capteur de fumée','capteur','Salle B12','actif',150,NULL,NULL,NULL);
/*!40000 ALTER TABLE `smart_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `date_naissance` date NOT NULL,
  `fonction` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `pseudo` varchar(50) NOT NULL,
  `photo` varchar(50) DEFAULT NULL,
  `niveau` varchar(10) NOT NULL,
  `points` int NOT NULL DEFAULT '0',
  `last_connexion` datetime DEFAULT NULL,
  `nb_connexions` int NOT NULL DEFAULT '0',
  `nb_actions` int NOT NULL DEFAULT '0',
  `validated` tinyint(1) NOT NULL DEFAULT '0',
  `validation_token` varchar(255) DEFAULT NULL,
  `token_expiration` datetime DEFAULT NULL,
  `theme_prefere` varchar(10) NOT NULL DEFAULT 'light',
  `date_inscription` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `pseudo` (`pseudo`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Martin','Jeanettee','1995-02-23','Eleve','jean.martin@ecole.fr','$2b$10$ftN5RUyMlhGbA/uvWTwVweeoNeIX3tdPZLZak.3e.7XzRGK2ccgU.','e-jMartine','jean.jpg','complexe',93,'2025-04-08 00:19:51',0,0,1,NULL,NULL,'light','2025-04-09 17:32:48',0),(2,'Lemoines','Sophiesss','2025-04-18','Professeur','sophie.lemoine@ecole.fr','$2b$10$/ErDgUDiMtEm.RGlIt4H9.z0IlgZL5KBmF7W8GUyQYlzW6b73YW.m','e-sLemoiness','sophie.jpg','admin',4,'2002-04-11 00:00:00',0,0,0,NULL,NULL,'light','2025-04-09 17:32:48',0),(3,'Durands','Paul','1994-09-15','Directeur','paul.durand@ecole.fr','$2b$10$HsC5xZT2rD1MU9ans/nwPO/Hg1QXQLTQD3NVE0mlaglo0wvVmlAIe','e-pDurand','paul.jpg','admin',7,'2025-04-14 01:40:30',0,0,1,NULL,NULL,'light','2025-04-09 17:32:48',1),(4,'Moreau','Emma','2016-09-04','Eleve','emma.moreau@ecole.fr','$2b$10$p/Ox8UnD42WQg64Zwwa9cONLUoeSKoTJybWDDPVz8gyQC66P8PZMK','e-eMoreau','emma.jpg','admin',3,NULL,0,0,1,NULL,NULL,'light','2025-04-09 17:32:48',0),(6,'Bouiboui','fafabui','2017-02-22','Directeur','gagaggaa@dfsf.com','$2b$10$7hNXKGiAcnw1STMwecXv3ul6ETsLzNsw35GlMd0ps1Kv1Jh4aC8s.','sa',NULL,'simple',30,NULL,0,0,1,NULL,NULL,'light','2025-04-09 18:01:53',0),(8,'jaqsc','knlqs','2025-04-10','eleve','jkeqs@efdqsw.fdqswx','$2b$10$NP1KmCOcC2wfh8IfRvUwO.HbEsbDvrBGERjHpZdPJGvbdwYEaBVsi','e-kjaqsc',NULL,'simple',0,NULL,0,0,1,NULL,NULL,'light','2025-04-09 18:09:40',0),(50,'sadam','haaa','2025-04-07','Personnel','huppermage.bmabrouk@gmail.com','$2b$10$zYf1tQPYklqL/RVnls9uIuZ.wEEaBuZS/1u8JCRApUoJcw3PFEP0a','pers-hsadam',NULL,'admin',1,NULL,0,0,1,'e83f56d452e1db06ed8146924f70bbc17c09b0b3','2025-04-12 19:18:10','light','2025-04-11 19:18:10',0),(57,'BEN MABROUK','Fares','2025-04-08','Eleve','fares.bmabrouk@gmail.com','$2b$10$/sGq56Ity.CR1GsJM.otVenT/tUOslsTxtfZQ2KYnZk47bFrqy8I6','e-fbenmabrouk',NULL,'simple',0,NULL,0,0,1,NULL,NULL,'light','2025-04-13 18:07:50',1),(58,'sasasa','dddd','2025-04-10','Directeur','qgbds@fqsdfdsq.fdha','$2b$10$YpUgtCXSBmHsVzv5G5VpH.rAEHtRlQ2qEFcHyWczQ.Ez9YfVpMn5i','prof-dsasasa',NULL,'admin',0,'2025-04-13 18:09:22',0,0,1,NULL,NULL,'light','2025-04-13 18:08:23',1),(63,'fdsfgd','fsdgsdf','2025-04-15','eleve','eliotrope.bmabrouk@gmail.com','$2b$10$2qwRhXNkenH4ZtkOlmRQL.rH/RwMygqBp0ZRucvaqzebbu0NIpiVm','e-ffdsfgd',NULL,'complexe',0,'2025-04-13 23:56:58',0,0,0,NULL,NULL,'light','2025-04-13 23:56:41',1),(64,'BEN MABROUK','Fares','2025-04-16','Eleve','fares.bmsabrouk@gmail.com','$2b$10$ToSEyXSYyqLu58urigKwK.dinWhu6TPV.dUTIvxVyCvTX4oKEm2NW','e-fbenmabrouk2',NULL,'simple',0,'2025-04-14 01:27:35',0,0,0,NULL,NULL,'light','2025-04-14 00:52:53',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_activity`
--

DROP TABLE IF EXISTS `users_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_activity` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ID_user_changeur` int NOT NULL,
  `ID_user_modified` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `ancienne_donnee` text,
  `nouvelle_donnee` text,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=180 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_activity`
--

LOCK TABLES `users_activity` WRITE;
/*!40000 ALTER TABLE `users_activity` DISABLE KEYS */;
INSERT INTO `users_activity` VALUES (1,4,3,'MODIFICATION NOM','Lemoine','Lemoiness','2025-04-09 10:30:31'),(2,4,3,'MODIFICATION EMAIL','sophie.lemoine@ecole.fr','sophie.lemoine@ecole.frs','2025-04-09 10:35:32'),(3,4,3,'MODIFICATION PSEUDO','e-sLemoine','e-sLemoines','2025-04-09 10:35:41'),(4,4,2,'MODIFICATION POINTS','96','94','2025-04-09 10:31:02'),(5,4,4,'MODIFICATION STATUT VALIDATION','1','0','2025-04-09 10:34:55'),(6,4,4,'MODIFICATION NOM','Durand','Durands','2025-04-09 10:35:22'),(7,3,6,'VALIDATION USER','0','1','2025-04-09 17:05:58'),(8,3,7,'VALIDATION USER','0','1','2025-04-09 17:05:59'),(9,3,8,'VALIDATION USER','0','1','2025-04-09 17:06:00'),(10,3,9,'VALIDATION USER','0','1','2025-04-09 17:06:01'),(11,3,10,'VALIDATION USER','0','1','2025-04-09 17:06:02'),(12,3,11,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 18:18:01'),(13,3,12,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 18:18:02'),(14,3,13,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 19:04:43'),(15,3,14,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 19:45:33'),(16,3,1,'MODIFICATION NIVEAU','simple','complexe','2025-04-09 20:58:29'),(17,3,15,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 21:08:43'),(18,3,16,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 21:08:44'),(19,3,17,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 21:08:45'),(20,3,18,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 21:08:47'),(21,3,19,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:14:41'),(22,3,20,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:14:43'),(23,3,21,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:14:44'),(24,3,22,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:14:47'),(25,3,23,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:14:49'),(26,3,24,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:14:57'),(27,3,8,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:15:03'),(28,3,7,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:15:06'),(29,3,10,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:15:07'),(30,3,9,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:15:09'),(31,3,25,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:20:35'),(32,3,19,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:20:44'),(33,3,20,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:20:46'),(34,3,21,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:20:48'),(35,3,22,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:20:51'),(36,3,23,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:20:52'),(37,3,19,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:21:16'),(38,3,9,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:25:07'),(39,3,9,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:25:40'),(40,3,2,'MODIFICATION STATUT VALIDATION','1','0','2025-04-09 23:37:04'),(41,3,2,'VALIDATION USER','0','1','2025-04-09 23:37:10'),(42,3,9,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:37:21'),(43,3,19,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:37:23'),(44,3,20,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:37:25'),(45,3,21,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:37:27'),(46,3,19,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:43:09'),(47,3,19,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:44:14'),(48,3,20,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:44:16'),(49,3,21,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:44:18'),(50,3,19,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:44:38'),(51,3,20,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:44:40'),(52,3,21,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-09 23:44:41'),(53,3,26,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-10 00:07:04'),(54,3,27,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-10 00:07:05'),(55,3,28,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-10 00:07:07'),(56,3,29,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-10 00:07:09'),(57,3,30,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-10 00:07:10'),(58,3,31,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-10 00:12:05'),(59,3,32,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 15:30:05'),(60,3,33,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 15:30:06'),(61,3,34,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 15:30:08'),(62,3,35,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 15:30:10'),(63,3,36,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 15:30:11'),(64,3,37,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 15:30:12'),(65,3,38,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 15:30:14'),(66,3,39,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:24'),(67,3,40,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:25'),(68,3,41,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:27'),(69,3,42,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:28'),(70,3,43,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:30'),(71,3,44,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:32'),(72,3,45,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:34'),(73,3,46,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 16:39:36'),(74,0,48,'VALIDATION EMAIL','0','1','2025-04-11 16:51:21'),(75,0,48,'VALIDATION EMAIL','0','1','2025-04-11 16:51:21'),(76,0,49,'VALIDATION EMAIL','0','1','2025-04-11 16:52:23'),(77,0,49,'VALIDATION EMAIL','0','1','2025-04-11 16:52:23'),(78,0,51,'VALIDATION EMAIL','0','1','2025-04-11 17:18:52'),(79,0,51,'VALIDATION EMAIL','0','1','2025-04-11 17:18:52'),(80,51,47,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 17:19:37'),(81,51,48,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 17:19:38'),(82,51,49,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 17:19:41'),(83,51,51,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-11 17:19:43'),(84,0,52,'VALIDATION EMAIL','0','1','2025-04-11 17:24:11'),(85,0,52,'VALIDATION EMAIL','0','1','2025-04-11 17:24:11'),(86,0,53,'VALIDATION EMAIL','0','1','2025-04-11 23:03:37'),(87,0,53,'VALIDATION EMAIL','0','1','2025-04-11 23:03:37'),(88,0,54,'VALIDATION EMAIL','0','1','2025-04-12 12:39:26'),(89,0,54,'VALIDATION EMAIL','0','1','2025-04-12 12:39:26'),(90,3,50,'VALIDATION USER','0','1','2025-04-12 13:40:37'),(91,3,52,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-12 16:50:58'),(92,3,5,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-12 16:54:46'),(93,0,55,'VALIDATION EMAIL','0','1','2025-04-12 23:17:42'),(94,0,55,'VALIDATION EMAIL','0','1','2025-04-12 23:17:42'),(95,3,53,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-12 23:29:09'),(96,3,2,'MODIFICATION NOM','Lemoine','Lemoines','2025-04-13 01:18:54'),(97,3,3,'MODIFICATION NIVEAU','admin','simple','2025-04-13 14:30:00'),(98,3,3,'MODIFICATION DATE DE NAISSANCE','1994-09-19 00:00:00.000','1994-09-18','2025-04-13 14:30:00'),(99,0,56,'VALIDATION EMAIL','0','1','2025-04-13 14:40:04'),(100,0,56,'VALIDATION EMAIL','0','1','2025-04-13 14:40:04'),(101,56,3,'MODIFICATION NIVEAU','simple','admin','2025-04-13 14:40:19'),(102,56,54,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 14:40:33'),(103,56,55,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 14:40:39'),(104,56,56,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 14:40:41'),(105,3,2,'MODIFICATION NIVEAU','complexe','simple','2025-04-13 15:13:11'),(106,3,2,'MODIFICATION NIVEAU','simple','admin','2025-04-13 15:13:16'),(107,3,1,'MODIFICATION POINTS','98','93','2025-04-13 15:13:21'),(108,3,1,'MODIFICATION FONCTION','Directeur','Personnel','2025-04-13 15:13:26'),(109,3,1,'MODIFICATION FONCTION','Personnel','Eleve','2025-04-13 15:13:31'),(110,3,3,'MODIFICATION STATUT VALIDATION','1','0','2025-04-13 15:13:43'),(111,3,3,'VALIDATION USER','0','1','2025-04-13 15:13:45'),(112,3,10,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 15:18:11'),(113,3,7,'MODIFICATION STATUT VALIDATION','1','0','2025-04-13 15:22:23'),(114,3,7,'MODIFICATION DATE DE NAISSANCE','2025-03-31 00:00:00.000','2025-03-30','2025-04-13 15:22:23'),(115,3,7,'VALIDATION USER','0','1','2025-04-13 15:22:25'),(116,3,7,'MODIFICATION DATE DE NAISSANCE','2025-03-30 00:00:00.000','2025-03-06','2025-04-13 15:22:30'),(117,3,6,'MODIFICATION DATE DE NAISSANCE','2017-02-03 00:00:00.000','2017-02-07','2025-04-13 15:22:35'),(118,3,6,'MODIFICATION DATE DE NAISSANCE','2017-02-07 00:00:00.000','2017-02-26','2025-04-13 15:22:43'),(119,3,6,'MODIFICATION EMAIL','buifabui@bui.com','gagaggaa@dfsf.com','2025-04-13 15:22:54'),(120,3,6,'MODIFICATION DATE DE NAISSANCE','2017-02-26 00:00:00.000','2017-02-25','2025-04-13 15:22:54'),(121,3,6,'MODIFICATION POINTS','0','30','2025-04-13 15:23:14'),(122,3,6,'MODIFICATION DATE DE NAISSANCE','2017-02-25 00:00:00.000','2017-02-24','2025-04-13 15:23:14'),(123,3,6,'MODIFICATION FONCTION','Personnel','Directeur','2025-04-13 15:23:18'),(124,3,6,'MODIFICATION DATE DE NAISSANCE','2017-02-24 00:00:00.000','2017-02-23','2025-04-13 15:23:18'),(125,58,59,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 16:32:35'),(126,58,9,'MODIFICATION STATUT VALIDATION','1','0','2025-04-13 16:32:42'),(127,58,9,'MODIFICATION DATE DE NAISSANCE','2025-04-11 00:00:00.000','2025-04-10','2025-04-13 16:32:42'),(128,58,9,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 16:32:45'),(129,0,60,'VALIDATION EMAIL','0','1','2025-04-13 19:23:44'),(130,0,60,'VALIDATION EMAIL','0','1','2025-04-13 19:23:44'),(131,0,61,'VALIDATION EMAIL','0','1','2025-04-13 19:24:29'),(132,0,61,'VALIDATION EMAIL','0','1','2025-04-13 19:24:29'),(133,3,2,'MODIFICATION STATUT VALIDATION','1','0','2025-04-13 20:27:14'),(134,3,60,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 20:27:17'),(135,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-10 00:00:00.000','1995-02-09','2025-04-13 21:07:40'),(136,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-09 00:00:00.000','1995-02-09','2025-04-13 21:21:46'),(137,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-09 00:00:00.000','1995-02-09','2025-04-13 21:22:02'),(138,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-09 00:00:00.000','1995-02-08','2025-04-13 21:22:25'),(139,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-08 00:00:00.000','1995-02-08','2025-04-13 21:24:03'),(140,3,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:24:04'),(141,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-08 00:00:00.000','1995-02-08','2025-04-13 21:24:11'),(142,3,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:24:11'),(143,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-08 00:00:00.000','1995-02-08','2025-04-13 21:24:18'),(144,3,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:24:18'),(145,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-08 00:00:00.000','1995-02-08','2025-04-13 21:24:18'),(146,3,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:24:18'),(147,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-08 00:00:00.000','1995-02-08','2025-04-13 21:24:18'),(148,3,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:24:18'),(149,3,1,'MODIFICATION DATE DE NAISSANCE','1995-02-08 00:00:00.000','1995-02-08','2025-04-13 21:24:18'),(150,3,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:24:18'),(151,0,62,'VALIDATION EMAIL','0','1','2025-04-13 21:28:29'),(152,0,62,'VALIDATION EMAIL','0','1','2025-04-13 21:28:29'),(153,62,3,'MODIFICATION NOM','Durands','Durand','2025-04-13 21:29:49'),(154,62,3,'MODIFICATION DATE DE NAISSANCE','1994-09-18 00:00:00.000','1994-09-17','2025-04-13 21:29:49'),(155,62,3,'MODIFICATION DATE DE NAISSANCE','1994-09-17 00:00:00.000','1994-09-16','2025-04-13 21:29:59'),(156,62,3,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:29:59'),(157,62,1,'MODIFICATION DATE DE NAISSANCE','1995-02-08 00:00:00.000','1995-02-07','2025-04-13 21:30:10'),(158,62,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:30:10'),(159,62,1,'MODIFICATION DATE DE NAISSANCE','1995-02-07 00:00:00.000','1995-02-07','2025-04-13 21:30:15'),(160,62,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:30:15'),(161,62,1,'MODIFICATION DATE DE NAISSANCE','1995-02-07 00:00:00.000','1995-02-23','2025-04-13 21:30:49'),(162,62,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:30:49'),(163,62,1,'MODIFICATION DATE DE NAISSANCE','1995-02-23 00:00:00.000','1995-02-23','2025-04-13 21:30:50'),(164,62,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:30:50'),(165,62,1,'MODIFICATION DATE DE NAISSANCE','1995-02-23 00:00:00.000','1995-02-23','2025-04-13 21:30:50'),(166,62,1,'CHANGEMENT MOT DE PASSE','MDP haché (inconnu)','nouveau MDP Haché (inconnu)','2025-04-13 21:30:50'),(167,3,3,'MODIFICATION NOM','Durand','Durands','2025-04-13 21:51:24'),(168,3,7,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 21:51:31'),(169,3,2,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 21:51:35'),(170,3,61,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 21:51:36'),(171,3,62,'SUPPRESSION UTILISATEUR','Existait','Existe plus','2025-04-13 21:51:38'),(172,0,63,'VALIDATION EMAIL','0','1','2025-04-13 21:56:49'),(173,0,63,'VALIDATION EMAIL','0','1','2025-04-13 21:56:49'),(174,3,6,'MODIFICATION PSEUDO','prof-fbouiboui','sa','2025-04-13 22:51:23'),(175,3,6,'MODIFICATION DATE DE NAISSANCE','2017-02-23 00:00:00.000','2017-02-22','2025-04-13 22:51:23'),(176,3,6,'MODIFICATION DATE DE NAISSANCE','2017-02-22 00:00:00.000','2017-02-22','2025-04-13 22:51:36'),(177,3,64,'MODIFICATION STATUT VALIDATION','1','0','2025-04-13 23:04:46'),(178,3,64,'MODIFICATION DATE DE NAISSANCE','2025-04-17 00:00:00.000','2025-04-16','2025-04-13 23:04:46'),(179,3,3,'MODIFICATION DATE DE NAISSANCE','1994-09-16 00:00:00.000','1994-09-15','2025-04-13 23:43:33');
/*!40000 ALTER TABLE `users_activity` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-14  2:11:56
