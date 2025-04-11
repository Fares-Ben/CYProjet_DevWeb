const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    // ou 'postgres', 'sqlite', etc.
});

const db = {};

db.Device = require('./Device')(sequelize, Sequelize.DataTypes);
// Répète l'import pour les autres modèles (comme Classe, Announcement, etc.)
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
