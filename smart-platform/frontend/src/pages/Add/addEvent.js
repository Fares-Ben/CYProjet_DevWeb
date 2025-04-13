import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col, Container } from 'react-bootstrap';
import { FaCalendarPlus, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const AddEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '17:00',
        participants: ''
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

        if (!formData.title.trim()) newErrors.title = 'Titre requis';
        if (!formData.location.trim()) newErrors.location = 'Lieu requis';
        if (!formData.date) newErrors.date = 'Date requise';
        if (!formData.startTime) newErrors.startTime = 'Heure de début requise';
        if (!formData.endTime) newErrors.endTime = 'Heure de fin requise';

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
                `${API_BASE_URL}/admin/events`,
                {
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    participants: formData.participants || 'Tous'
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
            console.error('Erreur création événement:', err);
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
                <Col md={8} lg={8}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                <FaCalendarPlus className="me-2" />
                                Ajouter un nouvel événement
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {success && (
                                <Alert variant="success">
                                    Événement créé avec succès! Redirection...
                                </Alert>
                            )}

                            {errors.submit && (
                                <Alert variant="danger">{errors.submit}</Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Titre *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        isInvalid={!!errors.title}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.title}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Lieu *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                isInvalid={!!errors.location}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.location}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date *</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                isInvalid={!!errors.date}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.date}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Heure de début *</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleChange}
                                                isInvalid={!!errors.startTime}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.startTime}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Heure de fin *</Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleChange}
                                                isInvalid={!!errors.endTime}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.endTime}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Participants (optionnel)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="participants"
                                        value={formData.participants}
                                        onChange={handleChange}
                                        placeholder="Ex: Classes de 3ème, Professeurs de sciences..."
                                    />
                                    <Form.Text className="text-muted">
                                        Laissez vide pour "Tous"
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Création en cours...' : 'Créer l\'événement'}
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

export default AddEvent;