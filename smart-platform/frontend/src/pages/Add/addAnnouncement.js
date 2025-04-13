import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col, Container } from 'react-bootstrap';
import { FaBullhorn, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const AddAnnouncement = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        urgent: false,
        date: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Titre requis';
        if (!formData.content.trim()) newErrors.content = 'Contenu requis';
        if (!formData.date) newErrors.date = 'Date requise';

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
                `${API_BASE_URL}/admin/announcements`,
                {
                    title: formData.title,
                    content: formData.content,
                    urgent: formData.urgent,
                    date: formData.date,
                    author: 'Admin' // Vous pouvez remplacer par le nom de l'admin connecté
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
            console.error('Erreur création annonce:', err);
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
                                <FaBullhorn className="me-2" />
                                Créer une nouvelle annonce
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {success && (
                                <Alert variant="success">
                                    Annonce créée avec succès! Redirection...
                                </Alert>
                            )}

                            {errors.submit && (
                                <Alert variant="danger">{errors.submit}</Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Titre</Form.Label>
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
                                    <Form.Label>Contenu</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        isInvalid={!!errors.content}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.content}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date</Form.Label>
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
                                    <Col md={6}>
                                        <Form.Group className="mb-3 d-flex align-items-center">
                                            <Form.Check
                                                type="checkbox"
                                                id="urgent-checkbox"
                                                label="Annonce urgente"
                                                name="urgent"
                                                checked={formData.urgent}
                                                onChange={handleChange}
                                                className="mt-3"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Publication en cours...' : 'Publier l\'annonce'}
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

export default AddAnnouncement;