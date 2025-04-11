import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Carousel,
    Form,
    Button,
    Badge,
    Alert
} from 'react-bootstrap';
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaBell,
    FaCalendarAlt,
    FaSearch,
    FaSignInAlt,
    FaUserPlus
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './VisitorHome.css';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api';

const VisitorHome = () => {
    const navigate = useNavigate();
    const [schoolData, setSchoolData] = useState({
        classes: [],
        announcements: [],
        events: [],
        smartDevices: []
    });

    const [filters, setFilters] = useState({
        deviceType: '',
        location: ''
    });

    // Chargement des données (simulé)
    useEffect(() => {
        const fetchData = async () => {
            const [classesRes, announcementsRes, eventsRes, devicesRes] = await Promise.all([
                fetch('http://localhost:3001/api/classes'),
                fetch('http://localhost:3001/api/announcements'),
                fetch('http://localhost:3001/api/events'),
                fetch('http://localhost:3001/api/smart-devices')
            ]);

            const [classes, announcements, events, smartDevices] = await Promise.all([
                classesRes.json(),
                announcementsRes.json(),
                eventsRes.json(),
                devicesRes.json()
            ]);

            setSchoolData({ classes, announcements, events, smartDevices });
        };

        fetchData();
    }, []);


    // Filtrage des appareils
    const filteredDevices = schoolData.smartDevices.filter(device =>
        (filters.deviceType ? device.type === filters.deviceType : true) &&
        (filters.location ? device.location === filters.location : true)
    );

    return (
        <div className="school-home">
            {/* Boutons d'authentification */}
            <div className="auth-buttons-container">
                <Button
                    variant="outline-primary"
                    className="auth-button"
                    onClick={() => navigate('/login')}
                >
                    <FaSignInAlt className="me-2" />
                    Connexion
                </Button>
                <Button
                    variant="primary"
                    className="auth-button"
                    onClick={() => navigate('/register')}
                >
                    <FaUserPlus className="me-2" />
                    Inscription
                </Button>
            </div>

            {/* Hero Section École */}
            <div className="school-hero">
                <div className="hero-content">
                    <h1>École Primaire Les Petits Génies</h1>
                    <p className="lead">L'innovation au service de l'éducation</p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <FaChalkboardTeacher size={28} />
                            <span>12 Professeurs</span>
                        </div>
                        <div className="stat-item">
                            <FaUserGraduate size={28} />
                            <span>240 Élèves</span>
                        </div>
                        <div className="stat-item">
                            <i className="bi bi-cpu"></i>
                            <span>18 Appareils connectés</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertes urgentes */}
            <Container className="my-4">
                {schoolData.announcements.filter(a => a.urgent).map(announcement => (
                    <Alert key={announcement.id} variant="danger" className="d-flex align-items-center">
                        <FaBell className="me-2" />
                        <strong>{announcement.title} : </strong> {announcement.content}
                    </Alert>
                ))}
            </Container>

            {/* Sections principales */}
            <Container className="school-sections">
                {/* Section Classes */}
                <section className="mb-5">
                    <h2 className="section-title">
                        <FaChalkboardTeacher className="me-2" />
                        Nos Classes
                    </h2>
                    <Row>
                        {schoolData.classes.map(classItem => (
                            <Col key={classItem.id} md={6} className="mb-4">
                                <Card className="class-card h-100">
                                    <Card.Body>
                                        <Card.Title>{classItem.name}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            Professeur: {classItem.teacher}
                                        </Card.Subtitle>
                                        <Card.Text>
                                            <span className="badge bg-primary">
                                                {classItem.students} élèves
                                            </span>
                                        </Card.Text>
                                        <Button variant="outline-primary" size="sm">
                                            Voir le dashboard
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Section Événements */}
                <section className="mb-5">
                    <h2 className="section-title">
                        <FaCalendarAlt className="me-2" />
                        Prochains Événements
                    </h2>
                    <Carousel indicators={false}>
                        {schoolData.events.map(event => (
                            <Carousel.Item key={event.id}>
                                <div className="event-slide p-4 rounded">
                                    <h3>{event.title}</h3>
                                    <p className="event-date">
                                        <FaCalendarAlt className="me-2" />
                                        {new Date(event.date).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </p>
                                    <p className="event-location">{event.location}</p>
                                    <Button variant="light" size="sm">
                                        Plus d'informations
                                    </Button>
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </section>

                {/* Section Appareils Connectés */}
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="section-title m-0">
                            <i className="bi bi-cpu me-2"></i>
                            Appareils Connectés
                        </h2>
                        <Button variant="outline-secondary" size="sm">
                            Voir tout
                        </Button>
                    </div>

                    {/* Filtres */}
                    <Card className="mb-4 filter-card">
                        <Card.Body>
                            <Row>
                                <Col md={5}>
                                    <Form.Group>
                                        <Form.Label>
                                            <FaSearch className="me-2" />
                                            Type d'appareil
                                        </Form.Label>
                                        <Form.Select
                                            value={filters.deviceType}
                                            onChange={(e) => setFilters({ ...filters, deviceType: e.target.value })}
                                        >
                                            <option value="">Tous les types</option>
                                            <option value="tableau">Tableaux interactifs</option>
                                            <option value="climatisation">Climatisation</option>
                                            <option value="securite">Sécurité</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group>
                                        <Form.Label>Localisation</Form.Label>
                                        <Form.Select
                                            value={filters.location}
                                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        >
                                            <option value="">Toutes les zones</option>
                                            <option value="Salle B12">Salle B12</option>
                                            <option value="Cour principale">Cour principale</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2} className="d-flex align-items-end">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setFilters({ deviceType: '', location: '' })}
                                    >
                                        Réinitialiser
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Liste des appareils */}
                    <Row>
                        {filteredDevices.map(device => (
                            <Col key={device.id} xl={3} lg={4} md={6} className="mb-4">
                                <Card className="device-card h-100">
                                    <Card.Body>
                                        <div className="device-header">
                                            <Card.Title>{device.name}</Card.Title>
                                            <Badge
                                                bg={device.status === 'actif' ? 'success' :
                                                    device.status === 'maintenance' ? 'warning' : 'secondary'}
                                            >
                                                {device.status}
                                            </Badge>
                                        </div>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            {device.type === 'tableau' ? 'Tableau interactif' :
                                                device.type === 'climatisation' ? 'Système de climatisation' : 'Appareil'}
                                        </Card.Subtitle>
                                        <div className="device-details">
                                            <p><i className="bi bi-geo-alt"></i> {device.location}</p>
                                            <p><i className="bi bi-clock-history"></i> {device.lastUsed}</p>
                                        </div>
                                    </Card.Body>
                                    <Card.Footer className="bg-transparent">
                                        <Button variant="primary" size="sm" className="me-2">
                                            Contrôler
                                        </Button>
                                        <Button variant="outline-secondary" size="sm">
                                            Détails
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>
            </Container>

            {/* CTA Final */}
            <div className="school-cta">
                <Container>
                    <h2>Une école connectée, une éducation innovante</h2>
                    <p className="cta-subtitle">
                        Découvrez comment notre plateforme améliore l'expérience éducative
                    </p>
                    <div className="cta-buttons">
                        <Button
                            variant="light"
                            size="lg"
                            className="me-3"
                            onClick={() => navigate('/register')}
                        >
                            <FaUserPlus className="me-2" />
                            S'inscrire maintenant
                        </Button>
                        <Button
                            variant="outline-light"
                            size="lg"
                            onClick={() => navigate('/login')}
                        >
                            <FaSignInAlt className="me-2" />
                            Espace membre
                        </Button>
                    </div>
                </Container>
            </div>
        </div>
    );
};


export default VisitorHome;
