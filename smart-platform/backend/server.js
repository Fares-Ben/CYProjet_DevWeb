const express = require('express');
const router = require('express').Router();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Charger les variables d'environnement
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Connexion à la base de données
const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
});

const convertValidatedToBoolean = (userData) => ({
  ...userData,
  validated: userData.validated === 1
});

function toFrenchDateTime(date) {
  return format(date, 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Europe/Paris' });
}

db.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur de connexion à la base :', err);
  } else {
    console.log('Connexion à la base OK 🎉');
    connection.release(); // Toujours libérer après usage
  }
});

const { format } = require('date-fns-tz');

function getFrenchDateTime() {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss', {
    timeZone: 'Europe/Paris'
  });
}

/* ************************* */
/* MIDDLEWARES D'AUTHENTIFICATION */
/* ************************* */

// Middleware modifié
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // Requête SQL pour récupérer les données fraîches
    const [rows] = await db.promise().query(
      'SELECT id, pseudo, niveau FROM users WHERE id = ?',
      [decoded.id]
    );



    if (!rows[0]) return res.sendStatus(403);
    req.user = rows[0]; // Injecte les données utilisateur
    next();
  } catch (err) {
    console.error('Token error:', err);
    res.sendStatus(403);
  }
};
// Endpoint /api/protected modifié
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Accès autorisé',
    user: req.user // Contient { id, pseudo, niveau }
  });
});

app.post('/api/login', async (req, res) => {
  const { pseudo, password } = req.body;

  try {
    // Vérification utilisateur
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE pseudo = ?',
      [pseudo]
    );

    if (!users.length) return res.status(401).json({ error: 'Utilisateur introuvable' });
    if (users[0].email_verified === 0) return res.status(401).json({ error: 'Veuiller valider votre adresse email afin de vous connecter.' });


    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const frenchDate = toFrenchDateTime(new Date());
    // MAJ derniere connexion
    await db.promise().query(
      'UPDATE users SET last_connexion = ? WHERE id = ?',
      [frenchDate, user.id]
    );

    // Réponse
    const token = jwt.sign({
      id: user.id,
      pseudo: user.pseudo,
      niveau: user.niveau,
      fonction: user.fonction
    }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        ...user,
        last_connexion: frenchDate
      }
    });

  } catch (err) {
    console.error('Erreur complète:', err);
    res.status(500).json({
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

const isAdmin = (req, res, next) => {
  // On suppose que le niveau est stocké dans le token
  // Si ce n'est pas le cas, il faudra faire une requête à la BDD
  if (req.user.niveau !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé - Admin requis' });
  }
  next();
};

/* ************************* */
/* ROUTES PUBLIQUES */
/* ************************* */

app.get('/api/classes', (req, res) => {
  db.query('SELECT * FROM classes', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/api/announcements', (req, res) => {
  db.query('SELECT * FROM announcements', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/api/events', (req, res) => {
  db.query('SELECT * FROM events', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/api/smart-devices', (req, res) => {
  db.query('SELECT * FROM smart_devices', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


/* ************************* */
/* ROUTES D'AUTHENTIFICATION */
/* ************************* */

/* ************************* */
/* ROUTES PROTÉGÉES */
/* ************************* */

// Route test pour vérifier l'authentification
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Accès autorisé',
    user: req.user
  });
});

// Routes admin - nécessitent à la fois authenticateToken et isAdmin
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM users WHERE validated = 1', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/api/admin/classes', authenticateToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM classes', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
app.get('/api/admin/announcements', authenticateToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM announcements', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
app.get('/api/admin/smart_devices', authenticateToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM smart_devices', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT COUNT(*) AS totalUsers FROM users');
    const [admins] = await db.promise().query('SELECT COUNT(*) AS totalAdmins FROM users WHERE niveau = "admin"');

    res.json({
      totalUsers: users[0].totalUsers,
      totalAdmins: admins[0].totalAdmins,
      // totalMessages: 0,
      // reportedMessages: 0,
      // totalReports: 0,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Endpoint pour valider un utilisateur
app.post('/api/validate-email/:id', async (req, res) => {
  const { id } = req.params;  // Récupération de l'ID à partir des paramètres de l'URL

  try {

    // Commence par effectuer les requêtes de mise à jour et attends qu'elles se terminent
    await db.promise().query('UPDATE users SET email_verified = 1 WHERE id = ?', [id]);

    await db.promise().query('UPDATE users SET validation_token = null WHERE id = ?', [id]);
    await db.promise().query('UPDATE users SET token_expiration = null WHERE id = ?', [id]);
    // 3. Enregistrement dans l'historique
    await db.promise().query(
      `INSERT INTO Users_activity 
      (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date) 
      VALUES ('0', ?, 'VALIDATION EMAIL', ?, ?, NOW())`,
      [req.params.id, 0, 1]
    );

    // Une fois toutes les requêtes terminées, envoie une réponse au client
    res.status(200).json({ message: 'L\'email a été validé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Erreur de validation demail',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


app.get('/api/admin/events', authenticateToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM events', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/api/admin/pending-users', authenticateToken, isAdmin, (req, res) => {
  db.query('SELECT * FROM users WHERE validated = FALSE', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Endpoint pour valider un utilisateur
app.post('/api/admin/validate-user/:id', authenticateToken, isAdmin, async (req, res) => {
  try {

    db.query('UPDATE users SET validated = 1 WHERE id = ?',
      [req.params.id]
    );

    // 3. Enregistrement dans l'historique
    await db.promise().query(
      `INSERT INTO Users_activity 
      (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date) 
      VALUES (?, ?, 'VALIDATION USER', ?, ?, NOW())`,
      [req.user.id, req.params.id, 0, 1]
    );

    await db.promise().query(
      'UPDATE users SET points = points + 1 WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Validation réussie',
      deletedId: req.params.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Erreur de validation',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/delete-user/:id', authenticateToken, isAdmin, async (req, res) => {
  try {

    db.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );


    // 3. Enregistrement dans l'historique
    await db.promise().query(
      `INSERT INTO Users_activity 
      (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date) 
      VALUES (?, ?, 'SUPPRESSION UTILISATEUR', 'Existait', 'Existe plus', NOW())`,
      [req.user.id, req.params.id]
    );

    res.json({
      message: 'Suppression réussie',
      deletedId: req.params.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Erreur de suppression',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/api/admin/update_password/:id', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Le nouveau mot de passe est requis.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe.' });
        }

        // Vérifie si un utilisateur a été modifié
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        res.json({ message: 'Mot de passe mis à jour avec succès.' });
      }
    );
    // 3. Enregistrement dans l'historique
    await db.promise().query(
      `INSERT INTO Users_activity 
          (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date) 
          VALUES (?, ?, 'CHANGEMENT MOT DE PASSE', 'MDP haché (inconnu)', 'nouveau MDP Haché (inconnu)', NOW())`,
      [req.user.id, req.params.id]
    );

  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du hachage du mot de passe.' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const connection = await db.promise().getConnection(); // Obtenez une connexion

  const formatDateForDB = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  };

  try {
    await connection.beginTransaction();

    // Récupération anciennes valeurs
    const [user] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    const anciennesValeurs = user[0];

    // Préparation des champs à mettre à jour
    const champs = [
      { nom: 'niveau', libelle: 'NIVEAU' },
      { nom: 'pseudo', libelle: 'PSEUDO' },
      { nom: 'validated', libelle: 'STATUT VALIDATION' },
      { nom: 'prenom', libelle: 'PRENOM' },
      { nom: 'nom', libelle: 'NOM' },
      { nom: 'email', libelle: 'EMAIL' },
      { nom: 'points', libelle: 'POINTS' },
      { nom: 'fonction', libelle: 'FONCTION' },
      { nom: 'date_naissance', libelle: 'DATE DE NAISSANCE' }
    ];

    // Traitement des modifications
    const modifications = [];

    for (const champ of champs) {
      const nouvelleValeur = champ.nom === 'date_naissance'
        ? formatDateForDB(req.body[champ.nom])
        : req.body[champ.nom];

      const ancienneValeur = champ.nom === 'date_naissance'
        ? formatDateForDB(anciennesValeurs[champ.nom])
        : anciennesValeurs[champ.nom];

      if (ancienneValeur !== nouvelleValeur) {

        // Mise à jour du champ
        await connection.query(
          `UPDATE users SET ${champ.nom} = ? WHERE id = ?`,
          [nouvelleValeur, id]
        );

        // Enregistrement dans l'historique
        await connection.query(
          `INSERT INTO Users_activity 
           (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            req.user.id,
            id,
            `MODIFICATION ${champ.libelle}`,
            champ.nom === 'date_naissance'
              ? formatDateForDB(anciennesValeurs[champ.nom])
              : anciennesValeurs[champ.nom],
            nouvelleValeur
          ]
        );

        modifications.push(champ.nom);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: modifications.length > 0
        ? "Champs mis à jour: " + modifications.join(', ')
        : "Aucune modification nécessaire",
      modifiedFields: modifications
    });

  } catch (err) {
    await connection.rollback();
    console.error("Erreur transaction:", err);
    res.status(500).json({
      error: "Échec des mises à jour",
      details: err.message
    });
  } finally {
    connection.release(); // Libération de la connexion
  }
});

const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou autre service
  auth: {
    user: process.env.EMAIL_USER, // à définir dans vos variables d'environnement
    pass: process.env.EMAIL_PASS  // à définir dans vos variables d'environnement
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password, niveau, fonction, date_naissance, prenom, nom } = req.body;

  if (!email || !password || !niveau || !fonction || !date_naissance || !prenom || !nom) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    // Vérifie si l'email existe déjà
    const [existingUsers] = await db.promise().query(
      'SELECT id FROM users WHERE email = ? ',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé.' });
    }

    // Construction du pseudo
    const prenomInitiale = prenom.trim().toLowerCase().charAt(0);
    const nomSanitized = nom.trim().toLowerCase().replace(/\s/g, '');
    let basePseudo = fonction.toLowerCase() === 'eleve'
      ? `e-${prenomInitiale}${nomSanitized}`
      : fonction.toLowerCase() === 'personnel' ?
        `pers-${prenomInitiale}${nomSanitized}` :
        `prof-${prenomInitiale}${nomSanitized}`;

    // Cherche tous les pseudos similaires
    const [similarPseudos] = await db.promise().query(
      'SELECT pseudo FROM users WHERE pseudo LIKE ?',
      [`${basePseudo}%`]
    );

    let finalPseudo = basePseudo;
    if (similarPseudos.length > 0) {
      const usedNumbers = similarPseudos
        .map(u => u.pseudo)
        .map(p => {
          const match = p.match(new RegExp(`^${basePseudo}(\\d+)$`));
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(n => n !== null);

      const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
      finalPseudo = `${basePseudo}${nextNumber}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Génération d'un token de validation
    const crypto = require('crypto');
    const validationToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expire dans 24h

    const photo = null;
    const points = 0;
    const last_connexion = null;
    const nb_connexions = 0;
    const nb_actions = 0;
    const email_verified = 0;
    const validated = 0;
    const theme_prefere = 'light';

    await db.promise().query(
      `INSERT INTO users 
      (nom, prenom, date_naissance, fonction, email, password, pseudo, photo, niveau, points, last_connexion, nb_connexions, nb_actions, validated, validation_token, token_expiration, theme_prefere, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        prenom,
        date_naissance,
        fonction,
        email,
        hashedPassword,
        finalPseudo,
        photo,
        niveau,
        points,
        last_connexion,
        nb_connexions,
        nb_actions,
        validated,
        validationToken,
        tokenExpiration,
        theme_prefere,
        email_verified
      ]
    );


    // Envoi de l'email de confirmation
    const confirmationLink = `${process.env.FRONTEND_URL}/validate-account?token=${validationToken}`;

    const mailOptions = {
      from: `"SmartEcole" <${process.env.EMAIL_FROM || 'no-reply@smartecole.com'}>`,
      to: email,
      subject: '🛎 Confirmation de votre inscription à SmartEcole',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
          <!-- En-tête -->
          <div style="background-color: #4a6fa5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bienvenue sur SmartEcole !</h1>
          </div>
          
          <!-- Corps du message -->
          <div style="padding: 25px;">
            <p style="font-size: 16px;">Bonjour,</p>            
            <p style="font-size: 16px;">Merci d'avoir rejoint notre plateforme intelligente pour établissements scolaires. Pour activer votre compte, veuillez confirmer votre adresse email :</p>
                        <p style="font-size: 16px;">Après validation, votre pseudo sera : ${finalPseudo}</p> </br>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}" 
                 style="background-color: #4a6fa5; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; font-weight: bold;
                        display: inline-block;">
                Confirmer mon email
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              <strong>Note :</strong> Ce lien expirera dans 24 heures.<br>
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
              <span style="word-break: break-all;">${confirmationLink}</span>
            </p>
          </div>
          
          <!-- Pied de page -->
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">
              Si vous n'avez pas demandé cette inscription, veuillez ignorer cet email.<br>
              © ${new Date().getFullYear()} SmartEcole. Tous droits réservés.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    const [users] = await db.promise().query(
      'SELECT id, token_expiration FROM users WHERE validation_token = ?',
      [validationToken]
    );

    const user = users[0];

    res.status(201).json({
      message: 'Utilisateur enregistré avec succès. Un email de confirmation a été envoyé.',
      token: validationToken,
      email: email,
      userID: user.id
    });


  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

app.get('/api/admin/users-activity', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        ua.ID_user_changeur AS userId,
        u.pseudo,
        ua.type,
        ua.date
      FROM Users_activity ua
      JOIN users u ON u.id = ua.ID_user_changeur
      ORDER BY ua.date DESC
      LIMIT 7
    `);

    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des activités :", err);
    res.status(500).json({ error: 'Erreur lors de la récupération des activités' });
  }
});

app.get('/api/validate-account', async (req, res) => {
  const { token } = req.query;

  const [users] = await db.promise().query(
    'SELECT id, token_expiration FROM users WHERE validation_token = ?',
    [token]
  );


  if (!token) {
    return res.status(400).json({ error: 'Token de validation manquant.' });
  }

  try {

    if (users.length === 0) {
      return res.status(404).json({ error: 'Token invalide ou compte déjà validé.' });
    }

    const user = users[0];
    const now = new Date();


    if (new Date(user.token_expiration) < now) {

      // Supprimer le compte expiré
      await db.promise().query('DELETE FROM users WHERE id = ?', [user.id]);
      return res.status(400).json({ error: 'Le token a expiré. Veuillez vous réinscrire.' });

    }


    res.status(200).json({
      message: 'Compte validé avec succès. Vous pouvez maintenant vous connecter.',
      userID: user.id
    });

  } catch (err) {
    console.error('Erreur lors de la validation du compte :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

app.get('/api/admin/classes-with-details', authenticateToken, isAdmin, (req, res) => {
  db.query(`
    SELECT c.*, u.pseudo as teacher_pseudo, u.nom as teacher_nom, u.prenom as teacher_prenom
    FROM classes c
    LEFT JOIN users u ON c.teacher_id = u.id
  `, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/api/admin/class-students/:classId', authenticateToken, isAdmin, (req, res) => {
  db.query(`
    SELECT u.id, u.pseudo, u.nom, u.prenom, u.age, u.photo
    FROM users u
    WHERE u.fonction = 'Eleve' AND u.class_id = ?
  `, [req.params.classId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
app.get('/api/profiles', authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log('Tentative de récupération du profil pour user ID:', userId);
  db.query(`
    SELECT 
      u.id, 
      u.pseudo, 
      u.nom, 
      u.prenom, 
      u.date_naissance, 
      u.email, 
      u.fonction, 
      u.niveau, 
      u.points, 
      u.date_inscription, 
      u.last_connexion,
      u.nb_connexions,
      u.nb_actions,
      u.theme_prefere
    FROM users u
    WHERE u.id = ?
  `, [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({
        message: 'Erreur serveur',
        error: err.message // Envoyer seulement le message d'erreur
      });
    }

    if (results.length === 0) {
      console.log('Aucun utilisateur trouvé pour ID:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = results[0];
    console.log('Profil trouvé:', user);
    res.json(user);
  });
});


// ✅ Récupérer tous les appareils
app.get('/api/admin/get-devices', authenticateToken, async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM smart_devices');
  res.json(rows);
});

// ✅ Créer un appareil
app.post('/api/admin/post-devices', authenticateToken, async (req, res) => {
  const {
    name, type, location, etat,
    consommation, Date_derniere_activite,
    Date_debut_maintenance, Date_fin_maintenance
  } = req.body;

  const [result] = await db.promise().query(`
      INSERT INTO smart_devices 
      (name, type, location, etat, consommation, Date_derniere_activite, Date_debut_maintenance, Date_fin_maintenance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, type, location, etat,
    consommation,
    Date_derniere_activite || null,
    Date_debut_maintenance || null,
    Date_fin_maintenance || null
  ]);
  const newDeviceId = result.insertId;


  // 3. Enregistrement dans l'historique
  await db.promise().query(
    `INSERT INTO objects_activity 
          (ID_user_changeur, ID_object_modified, type, ancienne_donnee, nouvelle_donnee, date) 
          VALUES (?, ?, 'AJOUT NOUVEAU APPAREIL', '0', 'nouveau appreil', NOW())`,
    [req.user.id, newDeviceId]
  );



  // ✅ Supprimer un appareil
  app.delete('/api/admin/delete-devices/:deviceId', authenticateToken, async (req, res) => {
    try {
      const deviceId = req.params.deviceId;

      // Vérification que l'appareil existe
      const [device] = await db.promise().query(
        'SELECT id FROM smart_devices WHERE id = ?',
        [deviceId]
      );

      if (device.length === 0) {
        return res.status(404).json({ error: 'Appareil non trouvé' });
      }

      // Suppression de l'appareil
      await db.promise().query(
        'DELETE FROM smart_devices WHERE id = ?',
        [deviceId]
      );

      res.status(200).json({ message: 'Appareil supprimé avec succès' });

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });

  res.status(201).json({ message: 'Appareil créé' });
});

// ✅ Mettre à jour un appareil
app.put('/api/admin/put-devices/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    name, type, location, etat,
    consommation, Date_derniere_activite,
    Date_debut_maintenance, Date_fin_maintenance
  } = req.body;

  await db.promise().query(`
      UPDATE smart_devices SET 
      name = ?, type = ?, location = ?, etat = ?, 
      consommation = ?, Date_derniere_activite = ?, 
      Date_debut_maintenance = ?, Date_fin_maintenance = ?
      WHERE id = ?
  `, [
    name, type, location, etat,
    consommation,
    Date_derniere_activite || null,
    Date_debut_maintenance || null,
    Date_fin_maintenance || null,
    id
  ]);

  res.json({ message: 'Appareil mis à jour' });
});

const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const PDFDocument = require('pdfkit');

app.get('/api/admin/generate-report', (req, res) => {
  const format = req.query.format;
  try {
    if (format === 'pdf'){
      
    const doc = new PDFDocument();

    res.setHeader('Content-Disposition', 'attachment; filename=rapport.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Rapport Administratif', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`);
    doc.moveDown();
    doc.fontSize(12).text('Voici un aperçu global du système :');
    doc.text('- 120 utilisateurs');
    doc.text('- 10 classes');
    doc.text('- 85 appareils actifs');
    doc.text('- 920 kWh consommés ce mois-ci');

    doc.end();
  
    } else {
      const csvWriter = createObjectCsvWriter({
        path: path.join(__dirname, 'rapport.csv'),
        header: [
            { id: 'name', title: 'Name' },
            { id: 'age', title: 'Age' },
            { id: 'city', title: 'City' }
        ]
    });

    const records = [
        { name: 'Alice', age: 25, city: 'Paris' },
        { name: 'Bob', age: 30, city: 'Lyon' },
        { name: 'Charlie', age: 35, city: 'Marseille' }
    ];

    csvWriter.writeRecords(records)
        .then(() => {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="rapport.csv"');
            res.sendFile(path.join(__dirname, 'rapport.csv')); 
        })
        .catch(err => {
            res.status(500).send('Erreur lors de la génération du CSV');
        });
    }
  } catch (err) {
    console.error("Erreur génération PDF :", err);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
});



/* ************************* */
/* DÉMARRAGE DU SERVEUR */
/* ************************* */

app.listen(port, () => {
  console.log(`API disponible sur http://localhost:${port}`);
});