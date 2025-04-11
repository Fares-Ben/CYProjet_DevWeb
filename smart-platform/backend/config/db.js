require('dotenv').config();
const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || null, // Gère explicitement le mot de passe vide
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        dialectOptions: {
            // Option importante pour les connexions sans mot de passe
            connectAttributes: {
                password: ''
            }
        }
    }
);