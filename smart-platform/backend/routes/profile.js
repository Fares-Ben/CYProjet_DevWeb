const express = require('express');
const router = express.Router();
const { User } = require('../models');  // Importer le modèle User
const authenticateJWT = require('../middlewares/authenticateJWT');  // Importer le middleware

// Route pour récupérer les informations du profil de l'utilisateur
router.get('/', authenticateJWT, async (req, res) => {
  const userId = req.user.id;  // L'utilisateur est authentifié grâce au middleware

  try {
    // Utiliser Sequelize pour récupérer l'utilisateur par ID
    const user = await User.findOne({
      attributes: ['id', 'pseudo', 'nom', 'prenom', 'email', 'date_naissance', 'genre', 'niveau', 'points', 'photo_profil', 'date_inscription', 'dernier_acces'],
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);  // Renvoie les informations de l'utilisateur
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

module.exports = router;
