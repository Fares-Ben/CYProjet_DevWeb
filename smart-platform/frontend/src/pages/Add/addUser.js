import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col, Container } from 'react-bootstrap';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const AddUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: '',
        fonction: 'Eleve',
        niveau: 'simple',
        date_naissance: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.nom.trim()) newErrors.nom = 'Nom requis';
        if (!formData.prenom.trim()) newErrors.prenom = 'Prénom requis';
        if (!formData.email.trim()) newErrors.email = 'Email requis';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
        if (!formData.password) newErrors.password = 'Mot de passe requis';
        else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        if (!formData.date_naissance) newErrors.date_naissance = 'Date de naissance requise';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/admin/add-user`,
                {
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    password: formData.password,
                    fonction: formData.fonction,
                    niveau: formData.niveau,
                    date_naissance: formData.date_naissance,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSuccess(true);
            setTimeout(() => {
                navigate('/admindashboard');
            }, 1500);
        } catch (err) {
            console.error('Erreur création utilisateur:', err);
            setErrors({
                submit: err.response?.data?.message || 'Erreur lors de la création'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Button
                variant="outline-secondary"
                onClick={() => navigate('/admindashboard')}
                className="mb-4"
            >
                <FaArrowLeft className="me-2" />
                Retour
            </Button>

            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                <FaUserPlus className="me-2" />
                                Ajouter un nouvel utilisateur
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {success && (
                                <Alert variant="success">
                                    Utilisateur créé avec succès! Redirection...
                                </Alert>
                            )}

                            {errors.submit && (
                                <Alert variant="danger">{errors.submit}</Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                isInvalid={!!errors.nom}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.nom}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Prénom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                isInvalid={!!errors.prenom}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.prenom}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mot de passe</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                isInvalid={!!errors.password}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirmer mot de passe</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                isInvalid={!!errors.confirmPassword}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.confirmPassword}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fonction</Form.Label>
                                            <Form.Select
                                                name="fonction"
                                                value={formData.fonction}
                                                onChange={handleChange}
                                            >
                                                <option value="Eleve">Élève</option>
                                                <option value="Professeur">Professeur</option>
                                                <option value="Personnel">Personnel</option>
                                                <option value="Directeur">Directeur</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Niveau d'accès</Form.Label>
                                            <Form.Select
                                                name="niveau"
                                                value={formData.niveau}
                                                onChange={handleChange}
                                            >
                                                <option value="simple">Simple</option>
                                                <option value="complexe">Complexe</option>
                                                <option value="admin">Administrateur</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Date de naissance</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date_naissance"
                                        value={formData.date_naissance}
                                        onChange={handleChange}
                                        isInvalid={!!errors.date_naissance}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.date_naissance}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Création en cours...' : 'Créer l\'utilisateur'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AddUser;