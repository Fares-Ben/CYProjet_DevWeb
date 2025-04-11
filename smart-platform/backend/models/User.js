module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        pseudo: { type: DataTypes.STRING, allowNull: false, unique: true },
        nom: { type: DataTypes.STRING, allowNull: false },
        prenom: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        mot_de_passe: { type: DataTypes.STRING, allowNull: false },
        date_naissance: { type: DataTypes.DATEONLY },
        genre: { type: DataTypes.ENUM('M', 'F', 'Autre') },
        type_utilisateur: { type: DataTypes.ENUM('élève', 'enseignant', 'personnel', 'administrateur'), allowNull: false },
        niveau: { type: DataTypes.ENUM('débutant', 'intermédiaire', 'avancé', 'expert'), defaultValue: 'débutant' },
        points: { type: DataTypes.INTEGER, defaultValue: 0 },
        photo_profil: { type: DataTypes.STRING },
        date_inscription: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        dernier_acces: { type: DataTypes.DATE }
    }, {
        tableName: 'utilisateurs', // important pour que Sequelize utilise la bonne table
        timestamps: false // on n'a pas besoin de `createdAt` ou `updatedAt`
    });


    return User;
};