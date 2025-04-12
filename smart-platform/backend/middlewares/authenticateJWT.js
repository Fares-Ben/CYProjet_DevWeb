// backend/middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
  // Récupérer le token dans l'en-tête Authorization (format Bearer <token>)
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Si le token n'est pas présent, retour d'une erreur 401
  if (!token) {
    return res.status(401).json({ error: 'Aucun token fourni' });
  }

  // Vérification du token avec la clé secrète
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      // Si le token est invalide ou expiré, retourner une erreur 403
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }

    // Ajouter les informations de l'utilisateur au request object
    req.user = user;  // Ces informations proviennent du token
    next();  // Passer au prochain middleware ou à la route
  });
};

module.exports = authenticateJWT;
