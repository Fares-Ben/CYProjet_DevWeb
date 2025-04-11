import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: '',
        date_naissance: '',
        niveau: 'simple',
        fonction: 'eleve'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Veuillez entrer un email valide');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }
        return true;
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    password: formData.password,
                    date_naissance: formData.date_naissance,
                    niveau: formData.niveau,
                    fonction: formData.fonction
                }),

            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                // Ne redirigez plus directement vers /login
                if (data.token) {
                    console.log("6. Token reçu depuis le backend:", data.token); // Log 7
                } else {
                    console.warn("Aucun token reçu dans la réponse du serveur"); // Log 8
                }
                // L'utilisateur doit d'abord valider son email
            } else {
                setError(data.error || "Erreur lors de l'inscription");
            }
        } catch (err) {
            console.error('Erreur d\'inscription:', err);
            setError("Erreur de connexion au serveur. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="register-container">
            <h2>Inscription</h2>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="formPseudo">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Votre nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        required
                        minLength="3"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPseudo">
                    <Form.Label>Prenom</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Votre prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        required
                        minLength="3"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Date de naissance</Form.Label>
                    <Form.Control
                        type="DATE"
                        placeholder="aaaa-mm-jj"
                        value={formData.date_naissance}
                        onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength="6"
                    />
                    <Form.Text muted>Minimum 6 caractères</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>Confirmez le mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formfonction">
                    <Form.Label>Fonction</Form.Label>
                    <Form.Select
                        value={formData.fonction}
                        onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                    >
                        <option value="Eleve">Eleve</option>
                        <option value="Personnel">Personnel</option>
                        <option value="Professeur">Professeur</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formNiveau">
                    <Form.Label>Niveau d'accès (option disponible que pour la version test) </Form.Label>
                    <Form.Select
                        value={formData.niveau}
                        onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    >
                        <option value="simple">Utilisateur simple</option>
                        <option value="complexe">Utilisateur avancé</option>
                        <option value="admin">Administrateur</option>
                    </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                    {isLoading ? (
                        <Spinner animation="border" size="sm" />
                    ) : (
                        'S\'inscrire'
                    )}
                </Button>
            </Form>

            <div className="mt-3 text-center">
                <p>Déjà inscrit ? <a href="/login">Connectez-vous ici</a></p>
            </div>
        </Container>
    );
};

export default RegisterPage;