import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ValidateAccountPage = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        const validateAccount = async () => {
            try {
                console.log('Token envoyé à l\'API :', token);

                const response = await axios.get(`http://localhost:3001/api/validate-account?token=${token}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });


                if (response.status === 200) {  // Utilisez response.status au lieu de response.ok
                    setStatus('success');
                    setMessage(response.data.message);  // Accès via .data
                } else {
                    setStatus('error');
                    setMessage(response.data.error || 'Erreur inconnue');
                }
            } catch (err) {
                console.error('Erreur API:', err);
                setStatus('error');

                // Meilleure gestion des erreurs Axios
                if (err.response) {
                    // Erreur venue du serveur (4xx/5xx)
                    setMessage(err.response.data.error || 'Erreur du serveur');
                } else if (err.request) {
                    // Pas de réponse du serveur
                    setMessage('Le serveur ne répond pas');
                } else {
                    // Erreur de configuration
                    setMessage('Erreur de configuration de la requête');
                }
            }
        };

        if (token) {
            validateAccount();
        }
    }, [token]);

    return (
        <Container className="my-5">
            <h2>Validation du compte</h2>

            {status === 'loading' && (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>Validation en cours...</p>
                </div>
            )}

            {status === 'success' && (
                <Alert variant="success">
                    {message}
                    <div className="mt-3">
                        <Button variant="primary" onClick={() => navigate('/login')}>
                            Se connecter
                        </Button>
                    </div>
                </Alert>
            )}

            {status === 'error' && (
                <Alert variant="danger">
                    {message}
                    <div className="mt-3">
                        <Button variant="secondary" onClick={() => navigate('/register')}>
                            S'inscrire à nouveau
                        </Button>
                    </div>
                </Alert>
            )}
        </Container>
    );
};

export default ValidateAccountPage;