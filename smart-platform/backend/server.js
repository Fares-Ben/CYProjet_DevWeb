require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { format } = require('date-fns-tz');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

// Configuration middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// Vérification de la connexion à la base de données
pool.getConnection()
  .then(connection => {
    console.log('Connexion à la base de données réussie 🎉');
    connection.release();
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
    process.exit(1);
  });

// Configuration de l'email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Utilitaires
const getFrenchDateTime = () => {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss', {
    timeZone: 'Europe/Paris'
  });
};

const formatDateForDB = (dateValue) => {
  if (!dateValue) return null;
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
};

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const [users] = await pool.query(
      'SELECT id, pseudo, niveau, fonction, validated FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(403).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = users[0];
    next();
  } catch (err) {
    console.error('Erreur de token:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }

    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Middleware pour vérifier les droits admin
const isAdmin = (req, res, next) => {
  if (req.user.niveau !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé - Admin requis' });
  }
  next();
};

// Routes publiques
app.get('/api/classes', async (req, res) => {
  try {
    const [classes] = await pool.query('SELECT * FROM classes');
    res.json(classes);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/announcements', async (req, res) => {
  try {
    const [announcements] = await pool.query('SELECT * FROM announcements ORDER BY date DESC');
    res.json(announcements);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM events ORDER BY date DESC');
    res.json(events);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/smart-devices', async (req, res) => {
  try {
    const [devices] = await pool.query('SELECT * FROM smart_devices');
    res.json(devices);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Authentification
app.post('/api/login', async (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
  }

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE pseudo = ?',
      [pseudo]
    );

    if (!users.length) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const user = users[0];

    if (user.email_verified === 0) {
      return res.status(401).json({ error: 'Veuillez valider votre email avant de vous connecter' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const frenchDate = getFrenchDateTime();
    await pool.query(
      'UPDATE users SET last_connexion = ? WHERE id = ?',
      [frenchDate, user.id]
    );

    const token = jwt.sign({
      id: user.id,
      pseudo: user.pseudo,
      niveau: user.niveau,
      fonction: user.fonction
    }, process.env.SECRET_KEY, { expiresIn: '8h' });

    res.json({
      token,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        niveau: user.niveau,
        fonction: user.fonction,
        last_connexion: frenchDate
      }
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes protégées
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Accès autorisé',
    user: req.user
  });
});

// Routes admin
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE validated = 1');
    res.json(users);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/pending-users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE validated = 0');
    res.json(users);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/admin/validate-user/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    await pool.query('BEGIN');

    await pool.query(
      'UPDATE users SET validated = 1 WHERE id = ?',
      [userId]
    );

    await pool.query(
      'UPDATE users SET points = points + 1 WHERE id = ?',
      [userId]
    );

    await pool.query(
      `INSERT INTO Users_activity 
      (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date) 
      VALUES (?, ?, 'VALIDATION USER', ?, ?, NOW())`,
      [req.user.id, userId, 0, 1]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Utilisateur validé avec succès',
      userId
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/delete-user/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    await pool.query('BEGIN');

    await pool.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    await pool.query(
      `INSERT INTO Users_activity 
      (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date) 
      VALUES (?, ?, 'SUPPRESSION UTILISATEUR', 'Existait', 'Existe plus', NOW())`,
      [req.user.id, userId]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Utilisateur supprimé avec succès',
      userId
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Récupération anciennes valeurs
    const [user] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const anciennesValeurs = user[0];

    // Champs à mettre à jour
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

    const modifications = [];

    for (const champ of champs) {
      if (req.body[champ.nom] !== undefined) {
        const nouvelleValeur = champ.nom === 'date_naissance'
          ? formatDateForDB(req.body[champ.nom])
          : req.body[champ.nom];

        const ancienneValeur = anciennesValeurs[champ.nom];

        if (ancienneValeur !== nouvelleValeur) {
          await connection.query(
            `UPDATE users SET ${champ.nom} = ? WHERE id = ?`,
            [nouvelleValeur, id]
          );

          await connection.query(
            `INSERT INTO Users_activity 
             (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              req.user.id,
              id,
              `MODIFICATION ${champ.libelle}`,
              ancienneValeur,
              nouvelleValeur
            ]
          );

          modifications.push(champ.nom);
        }
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
    console.error("Erreur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    connection.release();
  }
});

// Gestion des appareils
app.get('/api/admin/devices', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [devices] = await pool.query('SELECT * FROM smart_devices');
    res.json(devices);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/admin/devices', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      name, type, location, etat,
      consommation
    } = req.body;

    if (!name || !type || !location) {
      return res.status(400).json({ error: 'Nom, type et localisation sont requis' });
    }

    await pool.query('BEGIN');

    const [result] = await pool.query(`
      INSERT INTO smart_devices 
      (name, type, location, etat, consommation)
      VALUES (?, ?, ?, ?, ?)
    `, [name, type, location, etat || 'actif', consommation || 0]);

    const deviceId = result.insertId;

    await pool.query(
      `INSERT INTO objects_activity 
      (ID_user_changeur, ID_object_modified, type, ancienne_donnee, nouvelle_donnee, date) 
      VALUES (?, ?, 'AJOUT APPAREIL', 'Nouvel appareil', ?, NOW())`,
      [req.user.id, deviceId, name]
    );

    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Appareil créé avec succès',
      deviceId
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/devices/:id', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.params.id;
    const {
      name, type, location, etat,
      consommation
    } = req.body;

    if (!name || !type || !location) {
      return res.status(400).json({ error: 'Nom, type et localisation sont requis' });
    }

    await pool.query('BEGIN');

    // Récupération anciennes valeurs
    const [device] = await pool.query('SELECT * FROM smart_devices WHERE id = ?', [deviceId]);
    if (device.length === 0) {
      return res.status(404).json({ error: 'Appareil non trouvé' });
    }

    const ancienDevice = device[0];

    await pool.query(`
      UPDATE smart_devices SET 
      name = ?, type = ?, location = ?, etat = ?, 
      consommation = ?
      WHERE id = ?
    `, [name, type, location, etat, consommation, deviceId]);

    // Enregistrement des modifications
    const champs = ['name', 'type', 'location', 'etat', 'consommation'];
    for (const champ of champs) {
      if (req.body[champ] !== undefined && req.body[champ] !== ancienDevice[champ]) {
        await pool.query(
          `INSERT INTO objects_activity 
          (ID_user_changeur, ID_object_modified, type, ancienne_donnee, nouvelle_donnee, date)
          VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            req.user.id,
            deviceId,
            `MODIFICATION ${champ.toUpperCase()}`,
            ancienDevice[champ],
            req.body[champ]
          ]
        );
      }
    }

    await pool.query('COMMIT');

    res.json({
      message: 'Appareil mis à jour avec succès',
      deviceId
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/devices/:id', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.params.id;

    await pool.query('BEGIN');

    const [device] = await pool.query('SELECT name FROM smart_devices WHERE id = ?', [deviceId]);
    if (device.length === 0) {
      return res.status(404).json({ error: 'Appareil non trouvé' });
    }

    await pool.query('DELETE FROM smart_devices WHERE id = ?', [deviceId]);

    await pool.query(
      `INSERT INTO objects_activity 
      (ID_user_changeur, ID_object_modified, type, ancienne_donnee, nouvelle_donnee, date) 
      VALUES (?, ?, 'SUPPRESSION APPAREIL', ?, 'Supprimé', NOW())`,
      [req.user.id, deviceId, device[0].name]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Appareil supprimé avec succès',
      deviceId
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Statistiques
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [activeDevices] = await pool.query('SELECT COUNT(*) AS total FROM smart_devices WHERE etat = "actif"');
    const [inactiveDevices] = await pool.query('SELECT COUNT(*) AS total FROM smart_devices WHERE etat = "inactif"');
    const [maintenanceDevices] = await pool.query('SELECT COUNT(*) AS total FROM smart_devices WHERE etat = "maintenance"');
    const [classes] = await pool.query('SELECT COUNT(*) AS total FROM classes');
    const [pendingUsers] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE validated = 0');

    res.json({
      stats: {
        totalUsers: users[0].total,
        activeDevices: activeDevices[0].total,
        inactiveDevices: inactiveDevices[0].total,
        maintenanceDevices: maintenanceDevices[0].total,
        totalClasses: classes[0].total,
        pendingRequests: pendingUsers[0].total,
        energyConsumption: 0, // À implémenter
        waterConsumption: 0,  // À implémenter
        monthlyComparison: {
          energy: 0,
          users: 0,
          devices: 0
        }
      }
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Activités
app.get('/api/admin/users-activity', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [activities] = await pool.query(`
      SELECT 
        ua.ID_user_changeur AS userId,
        u.pseudo,
        ua.type,
        ua.date
      FROM Users_activity ua
      JOIN users u ON u.id = ua.ID_user_changeur
      ORDER BY ua.date DESC
      LIMIT 50
    `);

    res.json(activities);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Inscription
app.post('/api/register', async (req, res) => {
  const { email, password, niveau, fonction, date_naissance, prenom, nom } = req.body;

  if (!email || !password || !niveau || !fonction || !date_naissance || !prenom || !nom) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Vérification email existant
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    // Génération du pseudo
    const prenomInitiale = prenom.trim().toLowerCase().charAt(0);
    const nomSanitized = nom.trim().toLowerCase().replace(/\s/g, '');
    let basePseudo = fonction.toLowerCase() === 'eleve'
      ? `e-${prenomInitiale}${nomSanitized}`
      : fonction.toLowerCase() === 'personnel'
        ? `pers-${prenomInitiale}${nomSanitized}`
        : `prof-${prenomInitiale}${nomSanitized}`;

    const [similarPseudos] = await connection.query(
      'SELECT pseudo FROM users WHERE pseudo LIKE ?',
      [`${basePseudo}%`]
    );

    let finalPseudo = basePseudo;
    if (similarPseudos.length > 0) {
      const nextNumber = similarPseudos.length + 1;
      finalPseudo = `${basePseudo}${nextNumber}`;
    }

    // Hachage mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Génération token validation
    const validationToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Insertion utilisateur
    const [result] = await connection.query(
      `INSERT INTO users 
      (nom, prenom, date_naissance, fonction, email, password, pseudo, niveau, 
       points, validated, validation_token, token_expiration, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        prenom,
        formatDateForDB(date_naissance),
        fonction,
        email,
        hashedPassword,
        finalPseudo,
        niveau,
        0, // points
        0, // validated
        validationToken,
        tokenExpiration,
        0  // email_verified
      ]
    );

    const userId = result.insertId;

    // Envoi email confirmation
    const confirmationLink = `${process.env.FRONTEND_URL}/validate-account?token=${validationToken}`;

    await transporter.sendMail({
      from: `"SmartEcole" <${process.env.EMAIL_FROM || 'no-reply@smartecole.com'}>`,
      to: email,
      subject: '🛎 Confirmation de votre inscription à SmartEcole',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4a6fa5; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Bienvenue sur SmartEcole !</h1>
          </div>
          <div style="padding: 25px;">
            <p>Bonjour,</p>
            <p>Merci d'avoir rejoint notre plateforme intelligente pour établissements scolaires.</p>
            <p>Votre pseudo sera : <strong>${finalPseudo}</strong></p>
            <p>Pour activer votre compte, veuillez confirmer votre adresse email :</p>
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
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">
              © ${new Date().getFullYear()} SmartEcole. Tous droits réservés.
            </p>
          </div>
        </div>
      `
    });

    await connection.commit();

    res.status(201).json({
      message: 'Inscription réussie. Un email de confirmation a été envoyé.',
      userId,
      pseudo: finalPseudo
    });
  } catch (err) {
    await connection.rollback();
    console.error('Erreur inscription:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

app.get('/api/validate-account', async (req, res) => {
  const { token } = req.query;

  const [users] = await pool.query(
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


// Endpoint pour valider un utilisateur
app.post('/api/validate-email/:id', async (req, res) => {
  const { id } = req.params;  // Récupération de l'ID à partir des paramètres de l'URL

  try {

    // Commence par effectuer les requêtes de mise à jour et attends qu'elles se terminent
    await pool.query('UPDATE users SET email_verified = 1 WHERE id = ?', [id]);

    await pool.query('UPDATE users SET validation_token = null WHERE id = ?', [id]);
    await pool.query('UPDATE users SET token_expiration = null WHERE id = ?', [id]);
    // 3. Enregistrement dans l'historique
    await pool.query(
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

// Validation email 
/* app.post('/api/validate-email/:token', async (req, res) => {
 const { token } = req.params;

 if (!token) {
   return res.status(400).json({ error: 'Token requis' });
 }

 const connection = await pool.getConnection();

 try {
   await connection.beginTransaction();

   const [users] = await connection.query(
     'SELECT id, token_expiration FROM users WHERE validation_token = ?',
     [token]
   );

   if (users.length === 0) {
     return res.status(404).json({ error: 'Token invalide' });
   }

   const user = users[0];
   const now = new Date();

   if (new Date(user.token_expiration) < now) {
     await connection.query('DELETE FROM users WHERE id = ?', [user.id]);
     return res.status(400).json({ error: 'Token expiré. Veuillez vous réinscrire.' });
   }

   // Validation email
   await connection.query(
     'UPDATE users SET email_verified = 1, validation_token = NULL, token_expiration = NULL WHERE id = ?',
     [user.id]
   );

   // Enregistrement activité
   await connection.query(
     `INSERT INTO Users_activity 
     (ID_user_changeur, ID_user_modified, type, ancienne_donnee, nouvelle_donnee, date) 
     VALUES (0, ?, 'VALIDATION EMAIL', 0, 1, NOW())`,
     [user.id]
   );

   await connection.commit();

   res.json({
     message: 'Email validé avec succès. Vous pouvez maintenant vous connecter.',
     userId: user.id
   });
 } catch (err) {
   await connection.rollback();
   console.error('Erreur validation email:', err);
   res.status(500).json({ error: 'Erreur serveur' });
 } finally {
   connection.release();
 }
});
*/
// Profil utilisateur
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT 
        id, pseudo, nom, prenom, date_naissance, email, 
        fonction, niveau, points, date_inscription, 
        last_connexion, nb_connexions, nb_actions, theme_prefere
      FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ✅ Créer un appareil
app.post('/api/admin/post-devices', authenticateToken, async (req, res) => {
  const {
    name, type, location, etat,
    consommation, Date_derniere_activite,
    Date_debut_maintenance, Date_fin_maintenance
  } = req.body;

  const [result] = await pool.query(`
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
  await pool.query(
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
      const [device] = await pool.query(
        'SELECT id FROM smart_devices WHERE id = ?',
        [deviceId]
      );

      if (device.length === 0) {
        return res.status(404).json({ error: 'Appareil non trouvé' });
      }

      // Suppression de l'appareil
      await pool.query(
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
app.put('/api/admin/devices/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    name, type, location, etat,
    consommation, Date_derniere_activite,
    Date_debut_maintenance, Date_fin_maintenance
  } = req.body;

  await pool.query(`
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


//génération d'un fichier pdf ou csv
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const PDFDocument = require('pdfkit');

app.get('/api/admin/generate-report', async (req, res) => {
  const format = req.query.format;
  const type = req.query.type;
  //génératino du pdf
  if (format === 'pdf') {
    try {
      if (type === 'energy') {

        const [rows] = await pool.query('SELECT SUM(consommation) as consoTotale, COUNT(*) as count FROM smart_devices');
        const [conso] = await pool.query('SELECT name, consommation FROM smart_devices GROUP BY name ORDER BY consommation DESC LIMIT 1');

        const tot = rows[0].consoTotale;
        const nb = rows[0].count;
        const max = conso[0].name;

        const doc = new PDFDocument();

        res.setHeader('Content-Disposition', 'attachment; filename=rapport.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Rapport sur la consommation énergétique des appareils', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown();
        doc.fontSize(12).text('Voici un aperçu global:');
        doc.text(`- Consommation totale: ${tot}`);
        doc.text(`- Nombre totale d'appareil: ${nb}`);
        doc.text(`- Appareil consommant le plus: ${max}`);

        doc.end();
      } else if (type === 'users') {

        const [rows] = await pool.query('SELECT COUNT(*) as count FROM smart_devices');
        const [act] = await pool.query('SELECT nom, prenom, nb_actions FROM users GROUP BY nom ORDER BY nb_actions DESC LIMIT 1');

        const tot = rows[0].consoTotale;
        const nb = rows[0].count;
        const nomMax = act[0].nom;
        const prenomMax = act[0].prenom;

        const doc = new PDFDocument();

        res.setHeader('Content-Disposition', 'attachment; filename=rapport.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Rapport sur les activités des utilisateurs', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown();
        doc.fontSize(12).text('Voici un aperçu global:');
        doc.text(`- Nombre totale d'utilisateurs: ${nb}`);
        doc.text(`- Utilisateur le plus actif: ${nomMax} ${prenomMax}`);

        doc.end();
      } else {

        const [rows] = await pool.query('SELECT COUNT(*) as count FROM smart_devices');
        const [act] = await pool.query('SELECT name, Date_derniere_activite FROM smart_devices GROUP BY name ORDER BY Date_derniere_activite DESC LIMIT 1');

        const nb = rows[0].count;
        const max = act[0].name;

        const doc = new PDFDocument();

        res.setHeader('Content-Disposition', 'attachment; filename=rapport.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text("Rapport sur l'utilisation des appareils", { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown();
        doc.fontSize(12).text('Voici un aperçu global:');
        doc.text(`- Nombre totale d'appareil: ${nb}`);
        doc.text(`- Appareil le plus récemment utilisé: ${max}`);
      }
    } catch (err) {
      console.error("Erreur génération PDF :", err);
      res.status(500).json({ error: "Erreur lors de la génération du PDF" });
    }
    //génération du csv
  } else {
    try {
      if (type === 'energy') {
        const [rows] = await pool.query('SELECT name, type, location, consommation FROM smart_devices');

        const csvPath = path.join(__dirname, 'rapport.csv');
        const csvWriter = createObjectCsvWriter({
          path: csvPath,
          header: [
            { id: 'name', title: 'Nom' },
            { id: 'type', title: 'Type' },
            { id: 'location', title: 'Location' },
            { id: 'consommation', title: 'Consommation' }
          ]
        });

        await csvWriter.writeRecords(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="rapport.csv"');
        res.sendFile(csvPath);

      } else if (type === 'users') {
        const [rows] = await pool.query('SELECT nom, prenom, fonction, niveau, nb_actions FROM users');

        const csvPath = path.join(__dirname, 'rapport.csv');
        const csvWriter = createObjectCsvWriter({
          path: csvPath,
          header: [
            { id: 'nom', title: 'Nom' },
            { id: 'prenom', title: 'Prenom' },
            { id: 'fonction', title: 'Fonction' },
            { id: 'niveau', title: 'Niveau' },
            { id: 'nb_actions', title: "Nombre d'actions" }
          ]
        });

        await csvWriter.writeRecords(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="rapport.csv"');
        res.sendFile(csvPath);

      } else {
        const [rows] = await pool.query('SELECT name, type, location, Date_derniere_activite FROM smart_devices');

        const csvPath = path.join(__dirname, 'rapport.csv');
        const csvWriter = createObjectCsvWriter({
          path: csvPath,
          header: [
            { id: 'name', title: 'Nom' },
            { id: 'type', title: 'Type' },
            { id: 'location', title: 'Location' },
            { id: 'Date_derniere_activite', title: 'Dernière activité' }
          ]
        });

        await csvWriter.writeRecords(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="rapport.csv"');
        res.sendFile(csvPath);

      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la génération du fichier CSV');
    }
  }
});

// ✅ Créer un utilisateur (par un admin)
app.post('/api/admin/add-user', authenticateToken, async (req, res) => {
  const {
    nom,
    prenom,
    email,
    password,
    fonction,
    niveau,
    date_naissance
  } = req.body;

  if (!nom || !prenom || !email || !password || !fonction || !niveau || !date_naissance) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifie si l’email existe déjà
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    // Génération automatique du pseudo
    const prenomInitiale = prenom.trim().toLowerCase().charAt(0);
    const nomSanitized = nom.trim().toLowerCase().replace(/\s/g, '');
    let basePseudo = fonction.toLowerCase() === 'eleve'
      ? `e-${prenomInitiale}${nomSanitized}`
      : fonction.toLowerCase() === 'personnel'
        ? `pers-${prenomInitiale}${nomSanitized}`
        : `prof-${prenomInitiale}${nomSanitized}`;

    const [similarPseudos] = await connection.query(
      'SELECT pseudo FROM users WHERE pseudo LIKE ?',
      [`${basePseudo}%`]
    );

    let finalPseudo = basePseudo;
    if (similarPseudos.length > 0) {
      const nextNumber = similarPseudos.length + 1;
      finalPseudo = `${basePseudo}${nextNumber}`;
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création directe : validé et email confirmé
    const [result] = await connection.query(
      `INSERT INTO users 
        (nom, prenom, date_naissance, fonction, email, password, pseudo, niveau, 
         points, validated, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 1)`,
      [
        nom,
        prenom,
        formatDateForDB(date_naissance),
        fonction,
        email,
        hashedPassword,
        finalPseudo,
        niveau
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: result.insertId,
      pseudo: finalPseudo
    });
  } catch (err) {
    await connection.rollback();
    console.error('Erreur add-user admin :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// ✅ Créer un événement
app.post('/api/admin/events', authenticateToken, async (req, res) => {
  const {
    title,
    description,
    location,
    date,
    startTime,
    endTime,
    participants
  } = req.body;

  if (!title || !location || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Tous les champs obligatoires ne sont pas remplis' });
  }

  const connection = await pool.getConnection();

  try {
    const [result] = await connection.query(
      `INSERT INTO events 
        (title, description, location, date, start_time, end_time, participants, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        location,
        date,
        startTime,
        endTime,
        participants || 'Tous',
        req.user.id // L’admin qui a créé l’événement
      ]
    );

    res.status(201).json({
      message: 'Événement créé avec succès',
      eventId: result.insertId
    });
  } catch (err) {
    console.error('Erreur lors de la création de l’événement :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l’événement' });
  }
});

// ✅ Créer une annonce
app.post('/api/admin/announcements', authenticateToken, async (req, res) => {
  const { title, content, urgent, date, author } = req.body;

  if (!title || !content || !date || !author) {
    return res.status(400).json({ error: 'Tous les champs requis ne sont pas remplis' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.query(
      `INSERT INTO announcements 
        (title, content, urgent, date, author, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        urgent ? 1 : 0,
        date,
        author,
        req.user.id // ID de l'admin qui a posté l’annonce
      ]
    );

    res.status(201).json({ message: 'Annonce créée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la création de l’annonce :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l’annonce' });
  } finally {
    connection.release();
  }
});

// Modifier une annonce
app.put('/api/admin/announcements/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, urgent, date } = req.body;

  if (!title || !content || !date) {
    return res.status(400).json({ error: 'Tous les champs obligatoires ne sont pas remplis' });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `UPDATE announcements 
       SET title = ?, content = ?, urgent = ?, date = ? 
       WHERE id = ?`,
      [title, content, urgent ? 1 : 0, date, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    res.json({ message: 'Annonce mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l’annonce :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l’annonce' });
  }
});

// Supprimer une annonce
app.delete('/api/admin/announcements/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `DELETE FROM announcements WHERE id = ?`,
      [id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    res.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l’annonce :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l’annonce' });
  }
});


// Route PUT pour modifier les informations de l'utilisateur
app.put('/api/profiles/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id); // Récupérer l'ID de l'utilisateur depuis l'URL
  const { nom, prenom, email, pseudo } = req.body; // Récupérer les nouvelles données dans le corps de la requête

  console.log('Contenu reçu pour update yaaa :', req.body);

  // Vérifier si l'utilisateur existe
  pool.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      return res.status(500).send('Erreur de base de données');
    }

    if (result.length === 0) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    const user = result[0];

    // Vérifier si l'utilisateur connecté est celui qui essaie de modifier les données
    if (user.id !== req.user.id) {
      return res.status(403).send('Vous ne pouvez pas modifier les données d\'un autre utilisateur');
    }

    // Mettre à jour les informations de l'utilisateur
    const updatedUser = {
      nom: nom || user.nom,
      prenom: prenom || user.prenom,
      email: email || user.email,
      pseudo: pseudo || user.pseudo,
    };

    pool.query(
      'UPDATE users SET nom = ?, prenom = ?, email = ?, pseudo = ? WHERE id = ?',
      [updatedUser.nom, updatedUser.prenom, updatedUser.email, updatedUser.pseudo, userId],
      (err, result) => {
        if (err) {
          return res.status(500).send('Erreur lors de la mise à jour des données');
        }

        res.json({
          message: 'Informations mises à jour avec succès',
          user: updatedUser,
        });
      }
    );
  });
});


/* ************************* */
/* DÉMARRAGE DU SERVEUR */
/* ************************* */

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});