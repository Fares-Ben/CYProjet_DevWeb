const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assurez-vous que ce chemin est correct
const Device = require('./Device'); // Si tu n'as pas encore défini `Device`, tu peux ignorer cette ligne pour l'instant

const Salle = sequelize.define('Salle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM(
            'classe',
            'bibliothèque',
            'cantine',
            'salle des professeurs',
            'bureau',
            'salle de sport',
            'laboratoire'
        ),
        allowNull: false
    },
    capacite: {
        type: DataTypes.INTEGER
    },
    etage: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'salles', // C'est important de spécifier le nom de la table
    timestamps: false // Comme tu n'as pas de colonnes `createdAt` et `updatedAt`, on désactive les timestamps
});

// Définir la relation : Une salle peut avoir plusieurs objets connectés (devices)
Salle.hasMany(Device, { foreignKey: 'salle_id', as: 'devices' });

module.exports = Salle;
