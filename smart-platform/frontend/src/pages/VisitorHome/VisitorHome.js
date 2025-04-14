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
    FaEye,
    FaChartLine,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './VisitorHome.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const VisitorHome = () => {
    const navigate = useNavigate();
    const [schoolData, setSchoolData] = useState({
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    const [currentDevice, setCurrentDevice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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
                if (data.user.niveau === 'admin') {
                    navigate('/admindashboard');
                    return;
                }

                setIsLoggedIn(true);
                setUserData(data.user);
                console.log("USER REÇU DU TOKEN:", data.user);


                if (data.user.validated === 0) {
                    setUserLevel('non-validated'); // blocage total
                } else {
                    setUserLevel(data.user.niveau);
                }

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
            const [announcementsRes, eventsRes, devicesRes, usersRes] = await Promise.all([
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
                fetch(`${API_BASE_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            const [announcements, events, smartDevices] = await Promise.all([
                announcementsRes.json(),
                eventsRes.json(),
                devicesRes.json(),
            ]);

            let users = [];
            if (usersRes && usersRes.ok) {
                users = await usersRes.json();
            }

            setSchoolData({ announcements, events, smartDevices, users });

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
            etat: device.etat
        });
        setShowEditModal(true);
    };

    const handleDeviceUpdate = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/devices/${currentDevice.id}`, {
                method: 'PUT',
                body: JSON.stringify(deviceForm),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
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
        const token = localStorage.getItem('token');

        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet appareil ?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/devices/${deviceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
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
        (filters.location ? device.location === filters.location : true) &&
        (searchTerm ?
            device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.type.toLowerCase().includes(searchTerm.toLowerCase())
            : true)
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
                    <h1>École Primaire Les Petits Génies</h1>{isLoggedIn ? (
                        <>
                            <p className="lead">Bienvenue, {userData?.pseudo} !</p>

                            {userData?.validated == 0 ? (
                                <Alert variant="warning" className="mt-3 text-center fw-bold">
                                    ⚠️ Votre compte est en attente de validation par un administrateur.
                                    <br />Vous êtes actuellement en mode lecture seule.
                                </Alert>
                            ) : (
                                <p>
                                    Vous avez accès aux fonctionnalités {userLevel === 'simple' ? 'de base' :
                                        userLevel === 'complexe' ? 'avancées' : 'd\'administration'}.
                                </p>
                            )}
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

                {/* Section Événements */}
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h2 className="section-title">
                            <FaCalendarAlt className="me-2" />
                            Prochains Événements
                        </h2>

                        {isLoggedIn && (userLevel === 'complexe' || userLevel === 'admin') && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/admindashboard/addEvent')}
                            >
                                Ajouter un évènement
                            </Button>
                        )}
                    </div>
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

                    {/* BARRE DE RECHERCHE */}
                    <Card className="mb-4 search-card">
                        <Card.Body>
                            <Form.Group>
                                <Form.Label>
                                    <FaSearch className="me-2" />
                                    Rechercher un appareil
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nom, type ou localisation..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

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
                                                bg={device.etat === 'actif' ? 'success' :
                                                    device.etat === 'maintenance' ? 'warning' : 'secondary'}
                                            >
                                                {device.etat}
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
                                        {isLoggedIn && userLevel !== 'non-validated' && (
                                            <>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleDeviceEdit(device)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                            </>
                                        )}
                                        {isLoggedIn && userLevel !== 'non-validated' && (userLevel === 'complexe' || userLevel === 'admin') && (
                                            <>
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
                {isLoggedIn && userLevel !== 'non-validated' && (
                    <section className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="section-title m-0">
                                <FaUsers className="me-2" />
                                Utilisateurs
                            </h2>
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
                                                        user.niveau === 'admin' ? 'danger' :
                                                            user.niveau === 'complexe' ? 'warning' : 'primary'
                                                    }>
                                                        {user.niveau}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowUserModal(true);
                                                        }}
                                                    >
                                                        <FaEye />
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

            <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Informations de l'utilisateur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser ? (
                        <>
                            <p><strong>ID :</strong> {selectedUser.id}</p>
                            <p><strong>Nom :</strong> {selectedUser.nom}</p>
                            <p><strong>Prénom :</strong> {selectedUser.prenom}</p>
                            <p><strong>Fonction :</strong> {selectedUser.fonction}</p>
                            <p><strong>Pseudo :</strong> {selectedUser.pseudo}</p>
                            <p><strong>Niveau :</strong> {selectedUser.niveau}</p>
                            <p><strong>Email :</strong> {selectedUser.email || 'Non renseigné'}</p>
                            <p><strong>Validé :</strong> {selectedUser.validated ? 'Oui' : 'Non'}</p>
                        </>
                    ) : (
                        <p>Aucun utilisateur sélectionné.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* Modal pour l'édition d'appareil */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modifier l'appareil</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoggedIn && (
                        <Form>
                            {(userLevel === 'simple' || userLevel === 'admin') && userData?.validated !== 0 && (
                                <>
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
                                </>
                            )}

                            {/* Tous les utilisateurs connectés peuvent modifier le statut */}
                            <Form.Group className="mb-3">
                                <Form.Label>Statut</Form.Label>
                                <Form.Select
                                    name="etat"
                                    value={deviceForm.etat || ''}
                                    onChange={handleFormChange}
                                    disabled={userLevel === 'visitor'}
                                >
                                    <option value="actif">Actif</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="inactif">Inactif</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    )}
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