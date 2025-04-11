import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { register } from '../../api/authAPI';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            alert("Inscription réussie ! Vérifiez votre email.");
        } catch (err) {
            setError(err.response?.data?.error || "Erreur d'inscription");
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Rôle</Form.Label>
                <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    <option value="student">Élève</option>
                    <option value="teacher">Enseignant</option>
                    <option value="staff">Personnel</option>
                </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
                S'inscrire
            </Button>
        </Form>
    );
};

export default Register;