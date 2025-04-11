module.exports = (sequelize, DataTypes) => {
    const Class = sequelize.define('Class', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom: { type: DataTypes.STRING, allowNull: false },
        niveau: { type: DataTypes.STRING, allowNull: false },
        professeur_principal_id: { type: DataTypes.INTEGER, allowNull: true }
    }, {
        tableName: 'classes',
        timestamps: false
    });

    return Class;
};
