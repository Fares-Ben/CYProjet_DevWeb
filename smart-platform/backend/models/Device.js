module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define('Device', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.ENUM('thermostat', 'éclairage', 'caméra', 'capteur', 'tableau interactif', 'prise intelligente', 'vidéoprojecteur', 'système audio'), allowNull: false },
        marque: { type: DataTypes.STRING },
        modele: { type: DataTypes.STRING },
        salle_id: { type: DataTypes.INTEGER, allowNull: true },
        statut: { type: DataTypes.ENUM('actif', 'inactif', 'maintenance', 'hors_service'), defaultValue: 'actif' },
        date_installation: { type: DataTypes.DATE },
        dernier_entretien: { type: DataTypes.DATE }
    }, {
        tableName: 'objets_connectes', // important pour que Sequelize utilise la bonne table
        timestamps: false // on n'a pas besoin de `createdAt` ou `updatedAt`
    });


    return Device;
};
