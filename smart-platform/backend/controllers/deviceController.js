// deviceController.js
const { Device } = require('../models/index');  // Assure-toi que c'est bien './models' si nécessaire
const { Classe, Announcement, Event, SmartDevice } = require('../models'); // Si tu utilises Sequelize ou d'autres ORM

// Fonction pour récupérer les données de l'école
exports.getSchoolData = async (req, res) => {
    try {
        // Récupérer les données des différents modèles
        const announcements = await Announcement.findAll();
        const events = await Event.findAll();
        const smartDevices = await SmartDevice.findAll();

        // Retourner les données au format JSON
        return res.json({
            classes,
            announcements,
            events,
            smartDevices
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        return res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
