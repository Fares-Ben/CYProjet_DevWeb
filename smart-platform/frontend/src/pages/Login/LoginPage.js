import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ pseudo, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Stocker le token dans le localStorage
                localStorage.setItem('token', data.token);

                setSuccess(`Connexion réussie !`);
                console.log("fonction :", data.user.niveau);  // Syntaxe correcte                setError('');

                // Rediriger vers la page d'accueil après 1 seconde
                setTimeout(() => {
                    if (data.user.niveau === "admin") {
                        navigate('/AdminDashboard');
                    } else {
                        navigate('/');
                    }
                }, 1000);
            } else {
                setError(data.error || "Identifiants incorrects");
                setSuccess('');
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError("Erreur de connexion au serveur. Veuillez réessayer.");
        }
    };

    return (
        <Container className="login-container">
            <h2>Connexion</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formPseudo">
                    <Form.Label>Pseudonyme (vous pouvez retrouver votre pseudo dans l'email de validation)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Entrez votre pseudo"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                    Se connecter
                </Button>
            </Form>
        </Container>
    );
};

export default LoginPage;