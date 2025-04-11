const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role
        });

        // Envoyer un email de confirmation (simulé)
        console.log(`Email envoyé à ${email} pour validation`);

        res.status(201).json({
            message: "Inscription réussie. Validez votre email."
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: "Utilisateur non trouvé" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Mot de passe incorrect" });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Ajout de points pour connexion (0.25 pts)
        await user.increment('points', { by: 0.25 });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                level: user.level
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};