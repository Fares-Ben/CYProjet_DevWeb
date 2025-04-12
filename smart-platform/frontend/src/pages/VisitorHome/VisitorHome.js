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
    Alert,
    Dropdown,
    Modal,
    Table
} from 'react-bootstrap';
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaBell,
    FaCalendarAlt,
    FaSearch,
    FaSignInAlt,
    FaUserPlus,
    FaUserCircle,
    FaSignOutAlt,
    FaEdit,
    FaTrash,
    FaUsers,
    FaCog,
    FaChartLine,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './VisitorHome.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const VisitorHome = () => {
    const navigate = useNavigate();
    const [schoolData, setSchoolData] = useState({
        classes: [],
        announcements: [],
        events: [],
        smartDevices: [],
        users: []
    });

    const [filters, setFilters] = useState({
        deviceType: '',
        location: ''
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userLevel, setUserLevel] = useState('visitor');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentDevice, setCurrentDevice] = useState(null);
    const [deviceForm, setDeviceForm] = useState({});


    // Ajoutez ceci dans la fonction verifyToken
    const verifyToken = async (token) => {
        try {
            const response = await fetch('http://localhost:3001/api/protected', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setIsLoggedIn(true);
                setUserData(data.user);
                setUserLevel(data.user.niveau);
                console.log('Token vérifié');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    // Chargement des données et vérification de l'authentification
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken(token);
        }
        if (!token) {
            console.log('pas de token');
        }

        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [classesRes, announcementsRes, eventsRes, devicesRes, usersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/classes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_BASE_URL}/announcements`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_BASE_URL}/events`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_BASE_URL}/smart-devices`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                isLoggedIn ? fetch(`${API_BASE_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }) : Promise.resolve(null)
            ]);

            const [classes, announcements, events, smartDevices] = await Promise.all([
                classesRes.json(),
                announcementsRes.json(),
                eventsRes.json(),
                devicesRes.json()
            ]);

            let users = [];
            if (usersRes && usersRes.ok) {
                users = await usersRes.json();
            }

            setSchoolData({ classes, announcements, events, smartDevices, users });
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserData(null);
        setUserLevel('visitor');
        navigate('/');
    };

    const handleDeviceEdit = (device) => {
        setCurrentDevice(device);
        setDeviceForm({
            name: device.name,
            type: device.type,
            location: device.location,
            status: device.status
        });
        setShowEditModal(true);
    };

    const handleDeviceUpdate = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/smart-devices/${currentDevice.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(deviceForm)
            });

            if (response.ok) {
                fetchData(); // Recharger les données
                setShowEditModal(false);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    const handleDeviceDelete = async (deviceId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet appareil ?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/smart-devices/${deviceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });

                if (response.ok) {
                    fetchData(); // Recharger les données
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleFormChange = (e) => {
        setDeviceForm({
            ...deviceForm,
            [e.target.name]: e.target.value
        });
    };

    // Filtrage des appareils
    const filteredDevices = schoolData.smartDevices.filter(device =>
        (filters.deviceType ? device.type === filters.deviceType : true) &&
        (filters.location ? device.location === filters.location : true)
    );

    return (
        <div className="school-home">
            {/* Barre de navigation / authentification */}
            <div className="auth-buttons-container">
                {isLoggedIn ? (
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                            <FaUserCircle className="me-2" />
                            {userData?.pseudo} ({userLevel})
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate('/profile')}>
                                <FaUserCircle className='me-2' />
                                Mon profil
                            </Dropdown.Item> {/* 
                            {(userLevel === 'complexe' || userLevel === 'admin') && (
                                <Dropdown.Item onClick={() => navigate('/AdminDashboard')}>
                                    <FaChartLine className="me-2" />
                                    Tableau de bord
                                </Dropdown.Item>
                            )}
                            {userLevel === 'admin' && (
                                <Dropdown.Item onClick={() => navigate('/admin')}>
                                    <FaCog className="me-2" />
                                    Administration
                                </Dropdown.Item>
                            )}*/}
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>
                                <FaSignOutAlt className="me-2" />
                                Déconnexion
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {/* Hero Section - Message différent si connecté */}
            <div className="school-hero">
                <div className="hero-content">
                    <h1>École Primaire Les Petits Génies</h1>
                    {isLoggedIn ? (
                        <>
                            <p className="lead">Bienvenue, {userData?.pseudo} !</p>
                            <p>Vous avez accès aux fonctionnalités {userLevel === 'simple' ? 'de base' :
                                userLevel === 'complexe' ? 'avancées' : 'd\'administration'}.</p>
                        </>
                    ) : (
                        <p className="lead">L'innovation au service de l'éducation</p>
                    )}

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
                            <span>{schoolData.smartDevices.length} Appareils connectés</span>
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
                                        {isLoggedIn && (userLevel === 'complexe' || userLevel === 'admin') && (
                                            <>
                                                <Button variant="outline-primary" size="sm">
                                                    Voir le dashboard
                                                </Button>
                                            </>
                                        )}
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
                        {isLoggedIn && (userLevel === 'complexe' || userLevel === 'admin') && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/add-device')}
                            >
                                Ajouter un appareil
                            </Button>
                        )}
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
                                    <Card.Footer className="bg-transparent"> {/* 
                                        <Button variant="primary" size="sm" className="me-2">
                                            Contrôler
                                        </Button> */}
                                        {isLoggedIn && (userLevel === 'complexe' || userLevel === 'admin') && (
                                            <>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleDeviceEdit(device)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeviceDelete(device.id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </>
                                        )}
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Section Appareils Connectés */}
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="section-title m-0">
                            <i className="bi bi-cpu me-2"></i>
                            Appareils Connectés
                        </h2>
                        {isLoggedIn && (userLevel === 'complexe' || userLevel === 'admin') && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/add-device')}
                            >
                                Ajouter un appareil
                            </Button>
                        )}
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
                                    <Card.Footer className="bg-transparent"> {/* 
                                        <Button variant="primary" size="sm" className="me-2">
                                            Contrôler
                                        </Button> */}
                                        {isLoggedIn && (userLevel === 'complexe' || userLevel === 'admin') && (
                                            <>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleDeviceEdit(device)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeviceDelete(device.id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </>
                                        )}
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Section Utilisateurs (visible seulement pour les admins) */}
                {isLoggedIn && userLevel === 'admin' && (
                    <section className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="section-title m-0">
                                <FaUsers className="me-2" />
                                Utilisateurs
                            </h2>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/add-user')}
                            >
                                Ajouter un utilisateur
                            </Button>
                        </div>

                        <Card>
                            <Card.Body>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Pseudo</th>
                                            <th>Niveau</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schoolData.users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.pseudo}</td>
                                                <td>
                                                    <Badge bg={
                                                        user.level === 'admin' ? 'danger' :
                                                            user.level === 'complexe' ? 'warning' : 'primary'
                                                    }>
                                                        {user.level}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button variant="outline-primary" size="sm" className="me-2">
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm">
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </section>
                )}
            </Container>

            {/* CTA Final - Adapté selon l'état de connexion */}
            <div className="school-cta">
                <Container>
                    <h2>Une école connectée, une éducation innovante</h2>
                    {isLoggedIn ? (
                        <p className="cta-subtitle">
                            Profitez de toutes les fonctionnalités {userLevel === 'simple' ? 'de base' :
                                userLevel === 'complexe' ? 'avancées' : 'd\'administration'} de notre plateforme
                        </p>
                    ) : (
                        <p className="cta-subtitle">
                            Découvrez comment notre plateforme améliore l'expérience éducative
                        </p>
                    )}

                    <div className="cta-buttons">{isLoggedIn && userLevel === 'admin' ? (
                        <Button
                            variant="light"
                            size="lg"
                            onClick={() => navigate('/admindashboard', { state: { userLevel } })}
                        >
                            Accéder au tableau de bord administrateur
                        </Button>
                    ) : !isLoggedIn ? (
                        <>
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
                        </>
                    ) : null}
                    </div>
                </Container>
            </div>

            {/* Modal pour l'édition d'appareil */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modifier l'appareil</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={deviceForm.name || ''}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={deviceForm.type || ''}
                                onChange={handleFormChange}
                            >
                                <option value="tableau">Tableau interactif</option>
                                <option value="climatisation">Climatisation</option>
                                <option value="securite">Sécurité</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Localisation</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={deviceForm.location || ''}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Statut</Form.Label>
                            <Form.Select
                                name="status"
                                value={deviceForm.status || ''}
                                onChange={handleFormChange}
                            >
                                <option value="actif">Actif</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="inactif">Inactif</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleDeviceUpdate}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VisitorHome;