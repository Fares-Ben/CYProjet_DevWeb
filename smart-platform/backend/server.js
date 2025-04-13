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
      'SELECT id, pseudo, niveau, fonction FROM users WHERE id = ?',
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

app.put('/api/admin/devices/:id', authenticateToken, isAdmin, async (req, res) => {
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

app.delete('/api/admin/devices/:id', authenticateToken, isAdmin, async (req, res) => {
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

// Validation email
app.post('/api/validate-email/:token', async (req, res) => {
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

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});