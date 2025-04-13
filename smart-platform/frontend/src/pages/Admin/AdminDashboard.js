import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Modal,
    Form,
    Alert,
    Badge,
    Dropdown,
    Nav,
    Tab,
    Tabs,
    ProgressBar,
    Spinner,
    Toast,
    ToastContainer
} from 'react-bootstrap';
import {
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaUserEdit,
    FaChalkboardTeacher,
    FaLaptop,
    FaSearch,
    FaBell,
    FaCalendarAlt,
    FaChartLine,
    FaCog,
    FaSignOutAlt,
    FaUserCircle,
    FaTrash,
    FaEdit,
    FaPlus,
    FaHome,
    FaUserCog,
    FaDatabase,
    FaShieldAlt,
    FaTools,
    FaChartPie,
    FaFileExport,
    FaRegBell,
    FaBars,
    FaTimes,
    FaRegChartBar
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userLevel } = location.state || {};
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);


    // États pour les données
    const [dashboardData, setDashboardData] = useState({
        users: [],
        pendingUsers: [],
        classes: [],
        devices: [],
        announcements: [],
        events: [],
        stats: {
            totalUsers: 0,
            activeDevices: 0,
            totalClasses: 0,
            pendingRequests: 0,
            energyConsumption: 0,
            waterConsumption: 0,
            usageStats: []
        }
    });

    // États pour l'UI
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deviceForm, setDeviceForm] = useState({
        name: '',
        type: '',
        location: '',
        etat: 'actif',
        consommation: 0,
    });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [reportType, setReportType] = useState('usage');
    const [exportFormat, setExportFormat] = useState('csv');

    function isUserValidated(selectedUser) {
        return selectedUser.Validated === 1;
    }
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // => '2025-04-16'
    };

    // Convertit pour l'affichage (reçoit 1/0/NULL, renvoie booléen)
    const toBoolean = (value) => value === 1;

    // Convertit pour la BDD (reçoit booléen, renvoie 1/0)
    const toTinyInt = (bool) => bool ? 1 : 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [
                    usersRes,
                    pendingRes,
                    classesRes,
                    devicesRes,
                    announcementsRes,
                    eventsRes,
                    statsRes,
                    activityRes
                ] = await Promise.all([
                    axios.get(`${API_BASE_URL}/admin/users`, { headers }),
                    axios.get(`${API_BASE_URL}/admin/pending-users`, { headers }),
                    axios.get(`${API_BASE_URL}/admin/classes`, { headers }),
                    axios.get(`${API_BASE_URL}/admin/smart_devices`, { headers }),
                    axios.get(`${API_BASE_URL}/admin/announcements`, { headers }),
                    axios.get(`${API_BASE_URL}/admin/events`, { headers }),
                    axios.get(`${API_BASE_URL}/admin/stats`, { headers }),
                    axios.get(`${API_BASE_URL}/admin/users-activity`, { headers })
                ]);

                setDashboardData({
                    users: usersRes.data,
                    pendingUsers: pendingRes.data,
                    classes: classesRes.data,
                    devices: devicesRes.data,
                    announcements: announcementsRes.data,
                    events: eventsRes.data,
                    stats: statsRes.data,
                    activityLogs: activityRes.data
                });

                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);


    function formatRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'il y a quelques secondes';
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} minutes`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} heures`;
        return `le ${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Fonctions de gestion
    const handleValidateUser = async (userId, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/validate-user/${userId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const [usersRes, pendingRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                axios.get(`${API_BASE_URL}/admin/pending-users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            setDashboardData(prev => ({
                ...prev,
                users: usersRes.data,
                pendingUsers: pendingRes.data,
                stats: {
                    ...prev.stats,
                    totalUsers: usersRes.data.length,
                    pendingRequests: pendingRes.data.length
                }
            }));

            setToastMessage(`Utilisateur ${action === 'validate' ? 'validé' : 'rejeté'} avec succès`);
            setShowToast(true);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const confirmDeleteUser = (userId) => {
        setUserToDelete(userId);
        setShowConfirmModal(true);
    };


    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');

            // 2. Appel API
            const response = await axios.delete(
                `${API_BASE_URL}/admin/delete-user/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 3. Mise à jour optimisée du state
            setDashboardData(prev => ({
                ...prev,
                users: prev.users.filter(user => user.id !== userId),
                pendingUsers: prev.pendingUsers.filter(user => user.id !== userId),
                stats: {
                    totalUsers: prev.stats.totalUsers - 1,
                    pendingRequests: prev.pendingUsers.some(u => u.id === userId)
                        ? prev.stats.pendingRequests - 1
                        : prev.stats.pendingRequests
                }
            }));

            // 4. Notification
            setToastMessage({
                visible: true,
                type: 'success',
                message: response.data.message || 'Suppression réussie'
            });

        } catch (err) {
            console.error('Erreur suppression:', err.response?.data || err.message);

            setToastMessage({
                visible: true,
                type: 'error',
                message: err.response?.data?.error
                    || 'Échec de la suppression. Veuillez réessayer.'
            });
        }
    };

    const handleUpdateUser = async () => {

        try {
            const token = localStorage.getItem('token');


            // 1. Mettre à jour les infos de l'utilisateur
            await axios.put(`${API_BASE_URL}/admin/users/${selectedUser.id}`, selectedUser, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // 2. Si un nouveau mot de passe a été défini, le mettre à jour
            if (selectedUser.newPassword && selectedUser.newPassword !== '') {
                await axios.post(`${API_BASE_URL}/admin/update_password/${selectedUser.id}`,
                    { newPassword: selectedUser.newPassword },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            const res = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setDashboardData(prev => ({
                ...prev,
                users: res.data,
                stats: {
                    ...prev.stats,
                    totalUsers: res.data.length
                }
            }));

            const [usersRes, pendingRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                axios.get(`${API_BASE_URL}/admin/pending-users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            setShowUserModal(false);
            setToastMessage('Utilisateur mis à jour avec succès');
            console.log('Toast déclenché :', showToast, toastMessage); // Doit afficher "true" et votre message
            setShowToast(true);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDeviceUpdate = async () => {
        try {
            const token = localStorage.getItem('token');

            if (selectedDevice) {
                await axios.put(`${API_BASE_URL}/admin/put-devices/${selectedDevice.id}`, deviceForm, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.post(`${API_BASE_URL}/admin/post-devices`, deviceForm, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            const res = await axios.get(`${API_BASE_URL}/admin/get-devices`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setDashboardData(prev => ({
                ...prev,
                devices: res.data,
                stats: {
                    ...prev.stats,
                    activeDevices: res.data.filter(d => d.etat === 'actif').length
                }
            }));

            setShowDeviceModal(false);
            setToastMessage(`Appareil ${selectedDevice ? 'mis à jour' : 'ajouté'} avec succès`);
            setShowToast(true);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDeviceDelete = async (deviceId) => {

        const token = localStorage.getItem('token');

        try {

            await axios.delete(`${API_BASE_URL}/admin/delete-devices/${deviceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const res = await axios.get(`${API_BASE_URL}/admin/devices`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setDashboardData(prev => ({
                ...prev,
                devices: res.data,
                stats: {
                    ...prev.stats,
                    activeDevices: res.data.filter(d => d.etat === 'actif').length
                }
            }));

            setToastMessage('Appareil supprimé avec succès');
            setShowToast(true);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleGenerateReport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/generate-report?format=${exportFormat}&type=${reportType}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            if (reportType === 'energy'){
                a.download = `rapport_sur_consommation.${exportFormat}`;
            }else if (reportType === 'usage') {
                a.download = `rapport_sur_utilisation.${exportFormat}`;
            } else {
                a.download = `rapport_sur_utilisateurs.${exportFormat}`;              
            }
            a.click();
    
            setToastMessage('Rapport PDF téléchargé avec succès');
            setShowToast(true);
            setShowReportModal(false);
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la génération du rapport");
        }
    };
    

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleDeviceEdit = (device) => {
        setSelectedDevice(device);
        setDeviceForm({
            name: device.name,
            type: device.type,
            location: device.location,
            etat: device.etat,
            consommation: device.consommation
        });
        setShowDeviceModal(true);
    };

    const handleAddDevice = () => {
        setSelectedDevice(null);
        setDeviceForm({
            name: '',
            type: '',
            location: '',
            etat: 'actif',
            consommation: 0,
        });
        setShowDeviceModal(true);
    };

    const handleFormChange = (e) => {
        setDeviceForm({
            ...deviceForm,
            [e.target.name]: e.target.value
        });
    };


    // Filtrage des utilisateurs
    const filteredUsers = dashboardData.users.filter(user =>
        user.pseudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3">Chargement des données...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="m-4">
                Erreur lors du chargement des données: {error}
                <Button variant="outline-danger" className="ms-3" onClick={() => window.location.reload()}>
                    Réessayer
                </Button>
            </Alert>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Barre de navigation */}
            <nav className="admin-navbar">
                <div className="admin-brand">
                    <FaHome className="me-2" />
                    <span>Tableau de bord administratif</span>
                </div>
                {/* Dans votre admin-navbar, ajoutez ce bouton */}
                <button
                    className="mobile-menu-toggle d-lg-none"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    {showMobileMenu ? <FaTimes /> : <FaBars />}
                </button>

                <div className="admin-nav-right">
                    <Button variant="outline-light" className="me-3" onClick={() => setShowReportModal(true)}>
                        <FaFileExport className="me-2" />
                        Générer rapport
                    </Button>

                    <Dropdown>
                        <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                            <FaUserCircle className="me-2" />
                            Administrateur
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate('/profile')}>
                                <FaUserCircle className='me-2' />
                                Mon profil
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>
                                <FaSignOutAlt className="me-2" />
                                Déconnexion
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </nav>

            {/* Contenu principal */}
            <div className="admin-container">
                {/* Sidebar */}
                <aside className={`admin-sidebar ${showMobileMenu ? 'show' : ''}`}>
                    <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav.Item>
                            <Nav.Link eventKey="dashboard">
                                <FaChartLine className="me-2" />
                                Tableau de bord
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="users">
                                <FaUsers className="me-2" />
                                Utilisateurs
                                {dashboardData.stats.pendingRequests > 0 && (
                                    <Badge bg="danger" className="ms-2">
                                        {dashboardData.stats.pendingRequests}
                                    </Badge>
                                )}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="devices">
                                <FaLaptop className="me-2" />
                                Appareils
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="classes">
                                <FaChalkboardTeacher className="me-2" />
                                Classes
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="announcements">
                                <FaRegBell className="me-2" />
                                Annonces
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="events">
                                <FaCalendarAlt className="me-2" />
                                Événements
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="stats">
                                <FaRegChartBar className="me-2" />
                                Statistiques
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="security">
                                <FaShieldAlt className="me-2" />
                                Sécurité
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </aside>

                {/* Main Content */}
                <main className="admin-main">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-content">
                            <h2 className="admin-title">Tableau de bord administratif</h2>

                            {/* Stats Cards */}
                            <div className="stats-grid">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <FaUsers />
                                        </div>
                                        <Card.Title>Utilisateurs</Card.Title>
                                        <div className="stat-value">{dashboardData.users.length}</div>
                                        <div className="stat-change">
                                            <span className="text-success">+5%</span> ce mois-ci
                                        </div>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button variant="link" onClick={() => setActiveTab('users')}>
                                            Voir tous les utilisateurs
                                        </Button>
                                    </Card.Footer>
                                </Card>

                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <FaLaptop />
                                        </div>
                                        <Card.Title>Appareils actifs</Card.Title>
                                        <div className="stat-value">{dashboardData.stats.activeDevices}</div>
                                        <div className="stat-change">
                                            <span className="text-success">+12%</span> ce mois-ci
                                        </div>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button variant="link" onClick={() => setActiveTab('devices')}>
                                            Gérer les appareils
                                        </Button>
                                    </Card.Footer>
                                </Card>

                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <FaChalkboardTeacher />
                                        </div>
                                        <Card.Title>Classes</Card.Title>
                                        <div className="stat-value">{dashboardData.stats.totalClasses}</div>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button variant="link" onClick={() => setActiveTab('classes')}>
                                            Voir les classes
                                        </Button>
                                    </Card.Footer>
                                </Card>

                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <FaUserCheck />
                                        </div>
                                        <Card.Title>Demandes en attente</Card.Title>
                                        <div className="stat-value">{dashboardData.pendingUsers.length}</div>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button variant="link" onClick={() => setActiveTab('users')}>
                                            Voir les demandes
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </div>

                            {/* Energy Consumption */}
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>Consommation énergétique</Card.Title>
                                    <div className="energy-stats">
                                        <div className="energy-value">
                                            <span>{dashboardData.stats.energyConsumption}</span> kWh
                                        </div>
                                        <ProgressBar now={65} label={`65%`} variant="warning" className="mb-3" />
                                        <div className="energy-comparison">
                                            <span className="text-success">↓ 12%</span> par rapport au mois dernier
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Recent Activity */}
                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <Card.Title>Activités récente</Card.Title>
                                            <div className="activity-list">
                                                {dashboardData.activityLogs.map((activity, index) => (
                                                    <div key={index} className="activity-item">
                                                        <div className="activity-avatar">
                                                            <FaUserCircle size={32} />
                                                        </div>
                                                        <div className="activity-details">
                                                            <div className="activity-user">{activity.pseudo}</div>
                                                            <div className="activity-action">{activity.type}</div>
                                                            <div className="activity-time">
                                                                {formatRelativeTime(activity.date)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Appareils récemment modifiés</Card.Title>
                                            <Table striped bordered hover size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Nom</th>
                                                        <th>Type</th>
                                                        <th>Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dashboardData.devices.slice(0, 5).map(device => (
                                                        <tr key={device.id}>
                                                            <td>{device.name}</td>
                                                            <td>{device.type}</td>
                                                            <td>
                                                                <Badge bg={
                                                                    device.etat === 'actif' ? 'success' :
                                                                        device.etat === 'maintenance' ? 'warning' : 'secondary'
                                                                }>
                                                                    {device.etat}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="users-content">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="admin-title">Gestion des utilisateurs</h2>
                                <Button variant="primary" onClick={() => navigate('/admin/add-user')}>
                                    <FaPlus className="me-2" />
                                    Ajouter un utilisateur
                                </Button>
                            </div>

                            <Tabs defaultActiveKey="active" className="mb-4">
                                <Tab eventKey="active" title={`Actifs (${dashboardData.users.length})`}>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <FaSearch className="me-2" />
                                                    Rechercher un utilisateur
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Rechercher par pseudo, nom ou prénom..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>

                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Pseudo</th>
                                                <th>Nom complet</th>
                                                <th>Fonction</th>
                                                <th>Email</th>
                                                <th>Niveau</th>
                                                <th>Points</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.pseudo}</td>
                                                    <td>{user.prenom} {user.nom}</td>
                                                    <td>{user.fonction}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <Badge bg={
                                                            user.niveau === 'admin' ? 'danger' :
                                                                user.niveau === 'complexe' ? 'warning' : 'primary'
                                                        }>
                                                            {user.niveau}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <ProgressBar now={(user.points / 100) * 100} label={user.points} />
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
                                                            <FaEdit />
                                                        </Button>
                                                        <Button variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => confirmDeleteUser(user.id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Tab>
                                <Tab eventKey="pending" title={`En attente (${dashboardData.pendingUsers.length})`}>
                                    {dashboardData.pendingUsers.length === 0 ? (
                                        <Alert variant="info">Aucune demande en attente</Alert>
                                    ) : (
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Pseudo</th>
                                                    <th>Email</th>
                                                    <th>Fonction</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData.pendingUsers.map(user => (
                                                    <tr key={user.id}>
                                                        <td>{user.id}</td>
                                                        <td>{user.pseudo}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.fonction}</td>
                                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => handleValidateUser(user.id, 'validate')}
                                                            >
                                                                <FaUserCheck /> Valider
                                                            </Button><Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => confirmDeleteUser(user.id)}
                                                            >
                                                                <FaUserTimes /> Rejeter
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Tab>
                            </Tabs>
                        </div>
                    )}

                    {/* Devices Tab */}
                    {activeTab === 'devices' && (
                        <div className="devices-content">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="admin-title">Gestion des appareils connectés</h2>
                                <Button variant="primary" onClick={handleAddDevice}>
                                    <FaPlus className="me-2" />
                                    Ajouter un appareil
                                </Button>
                            </div>

                            <Row className="mb-4">
                                <Col md={4}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <Card.Title>Répartition par type</Card.Title>
                                            <div className="device-type-chart">
                                                {/* Ici vous pourriez intégrer un graphique */}
                                                <div className="chart-legend">
                                                    <div><span className="legend-color tableau"></span> Tableaux (45%)</div>
                                                    <div><span className="legend-color climatisation"></span> Climatisation (30%)</div>
                                                    <div><span className="legend-color securite"></span> Sécurité (15%)</div>
                                                    <div><span className="legend-color autre"></span> Autre (10%)</div>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <Card.Title>Statut des appareils</Card.Title>
                                            <div className="device-status-chart">
                                                <div className="status-item">
                                                    <div className="status-label">Actifs</div>
                                                    <ProgressBar now={75} label={`${dashboardData.stats.activeDevices}`} variant="success" />
                                                </div>
                                                <div className="status-item">
                                                    <div className="status-label">Maintenance</div>
                                                    <ProgressBar now={15} label={`${Math.floor(dashboardData.devices.length * 0.15)}`} variant="warning" />
                                                </div>
                                                <div className="status-item">
                                                    <div className="status-label">Inactifs</div>
                                                    <ProgressBar now={10} label={`${Math.floor(dashboardData.devices.length * 0.1)}`} variant="secondary" />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <Card.Title>Actions rapides</Card.Title>
                                            <div className="quick-actions">
                                                <Button variant="outline-primary" className="w-100 mb-2">
                                                    <FaTools className="me-2" />
                                                    Planifier maintenance
                                                </Button>
                                                <Button variant="outline-success" className="w-100 mb-2">
                                                    <FaDatabase className="me-2" />
                                                    Sauvegarder configuration
                                                </Button>
                                                <Button variant="outline-info" className="w-100">
                                                    <FaChartPie className="me-2" />
                                                    Voir statistiques
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nom</th>
                                        <th>Type</th>
                                        <th>Localisation</th>
                                        <th>Statut</th>
                                        <th>Consommation (en Kw/h)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.devices.map(device => (
                                        <tr key={device.id}>
                                            <td>{device.id}</td>
                                            <td>{device.name}</td>
                                            <td>
                                                {device.type === 'tableau' ? 'Tableau interactif' :
                                                    device.type === 'climatisation' ? 'Climatisation' :
                                                        device.type === 'securite' ? 'Sécurité' : device.type}
                                            </td>
                                            <td>{device.location}</td>
                                            <td>
                                                <Badge bg={
                                                    device.etat === 'actif' ? 'success' :
                                                        device.etat === 'maintenance' ? 'warning' : 'secondary'
                                                }>
                                                    {device.etat}
                                                </Badge>
                                            </td>
                                            <td>{device.lastActivity || 'N/A'}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'stats' && (
                        <div className="stats-content">
                            <h2 className="admin-title mb-4">Statistiques et analyses</h2>

                            <Tabs defaultActiveKey="usage" className="mb-4">
                                <Tab eventKey="usage" title="Utilisation">
                                    <Row>
                                        <Col md={6}>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Card.Title>Activité des utilisateurs</Card.Title>
                                                    <div className="chart-placeholder">
                                                        [Graphique d'activité des utilisateurs]
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Card.Title>Utilisation des appareils</Card.Title>
                                                    <div className="chart-placeholder">
                                                        [Graphique d'utilisation des appareils]
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={12}>
                                            <Card>
                                                <Card.Body>
                                                    <Card.Title>Historique des connexions</Card.Title>
                                                    <Table striped bordered hover>
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th>Utilisateur</th>
                                                                <th>Type</th>
                                                                <th>Durée</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dashboardData.stats.usageStats.slice(0, 10).map((stat, index) => (
                                                                <tr key={index}>
                                                                    <td>{new Date(stat.date).toLocaleString()}</td>
                                                                    <td>{stat.user}</td>
                                                                    <td>{stat.type}</td>
                                                                    <td>{stat.duration}</td>
                                                                    <td>{stat.actions}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Tab>
                                <Tab eventKey="resources" title="Ressources">
                                    <Row>
                                        <Col md={6}>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Card.Title>Consommation énergétique</Card.Title>
                                                    <div className="chart-placeholder">
                                                        [Graphique de consommation énergétique]
                                                    </div>
                                                    <div className="resource-details mt-3">
                                                        <div className="resource-item">
                                                            <span className="resource-label">Total ce mois-ci:</span>
                                                            <span className="resource-value">{dashboardData.stats.energyConsumption} kWh</span>
                                                        </div>
                                                        <div className="resource-item">
                                                            <span className="resource-label">Économies:</span>
                                                            <span className="resource-value text-success">12% ↓</span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Card.Title>Consommation d'eau</Card.Title>
                                                    <div className="chart-placeholder">
                                                        [Graphique de consommation d'eau]
                                                    </div>
                                                    <div className="resource-details mt-3">
                                                        <div className="resource-item">
                                                            <span className="resource-label">Total ce mois-ci:</span>
                                                            <span className="resource-value">{dashboardData.stats.waterConsumption} m³</span>
                                                        </div>
                                                        <div className="resource-item">
                                                            <span className="resource-label">Économies:</span>
                                                            <span className="resource-value text-success">8% ↓</span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Tab>
                            </Tabs>
                        </div>
                    )}

                    {/* Other tabs would follow the same pattern */}
                </main>
            </div>

            {/* Modals */}
            {/* User Modal */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Modifier l'utilisateur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Pseudo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedUser.pseudo}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                pseudo: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedUser.email}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                email: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nom</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedUser.nom}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                nom: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prénom</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedUser.prenom}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                prenom: e.target.value
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}><Form.Group className="mb-3">
                                    <Form.Label>Nouveau mot de passe</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedUser.newPassword || ''}
                                        onChange={(e) => setSelectedUser({
                                            ...selectedUser,
                                            newPassword: e.target.value
                                        })}
                                    />
                                </Form.Group>

                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date de naissance</Form.Label>
                                        <Form.Control
                                            type="Date"
                                            value={selectedUser.date_naissance ? formatDateForInput(selectedUser.date_naissance) : ''}
                                            onChange={(e) => {
                                                setSelectedUser({
                                                    ...selectedUser,
                                                    date_naissance: e.target.value
                                                })
                                                console.log('[DEBUG] Ancienne valeur:', selectedUser?.date_naissance);
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Niveau</Form.Label>
                                        <Form.Select
                                            value={selectedUser.niveau}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                niveau: e.target.value
                                            })}
                                        >
                                            <option value="simple">Simple</option>
                                            <option value="complexe">Complexe</option>
                                            <option value="admin">Administrateur</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}><Form.Group className="mb-3">
                                    <Form.Label>
                                        Statut : {selectedUser.validated === 1 ? "Validé" : "Non validé"}
                                    </Form.Label>
                                    <div className="d-flex align-items-center"><Form.Check
                                        type="switch"
                                        id="validation-switch"
                                        label={selectedUser.validated ? "Validé" : "Non validé"}
                                        checked={selectedUser.validated}
                                        onChange={(e) => {
                                            setSelectedUser({
                                                ...selectedUser,
                                                validated: e.target.checked
                                            });
                                        }}
                                    />

                                    </div>
                                </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Points</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={selectedUser.points}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                points: parseInt(e.target.value) || 0
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Fonction</Form.Label>
                                <Form.Select
                                    value={selectedUser.fonction}
                                    onChange={(e) => setSelectedUser({
                                        ...selectedUser,
                                        fonction: e.target.value
                                    })}
                                >
                                    <option value="Eleve">Élève</option>
                                    <option value="Personnel">Personnel</option>
                                    <option value="Professeur">Professeur</option>
                                    <option value="Directeur">Directeur</option>
                                </Form.Select>
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3"><Form.Label>
                                        {selectedUser.last_connexion
                                            ? `Dernière connexion : ${new Date(selectedUser.last_connexion).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZone: 'Europe/Paris',
                                                hour12: false  // Pour forcer le format 24h
                                            })}`
                                            : 'Dernière connexion : Jamais connecté'}
                                    </Form.Label>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3"><Form.Label>
                                        {selectedUser.date_inscription
                                            ? `Date d'inscription : ${new Date(selectedUser.date_inscription).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZone: 'Europe/Paris',
                                                hour12: false  // Pour forcer le format 24h
                                            })}`
                                            : "Date d'inscription : Jamais inscrit ???"}
                                    </Form.Label>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleUpdateUser}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Device Modal */}
            <Modal show={showDeviceModal} onHide={() => setShowDeviceModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedDevice ? 'Modifier appareil' : 'Ajouter un appareil'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nom</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={deviceForm.name}
                                        onChange={handleFormChange}
                                        placeholder="Nom de l'appareil"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={deviceForm.type}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">Sélectionner un type</option>
                                        <option value="tableau">Tableau interactif</option>
                                        <option value="climatisation">Climatisation</option>
                                        <option value="securite">Système de sécurité</option>
                                        <option value="eclairage">Éclairage intelligent</option>
                                        <option value="capteur">Capteur</option>
                                        <option value="Alarme">Alarme - Détecteur de fumée</option>
                                        <option value="capteur">Capteur</option>
                                        <option value="autre">Autre</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                {/* Suite du Device Modal */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Localisation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={deviceForm.location}
                                        onChange={handleFormChange}
                                        placeholder="Salle B12, Cour principale..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Etat</Form.Label>
                                    <Form.Select
                                        name="etat"
                                        value={deviceForm.etat}
                                        onChange={handleFormChange}
                                    >
                                        <option value="actif">Actif</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="inactif">Inactif</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>consommation (en kw/h)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="consommation"
                                    value={deviceForm.consommation}
                                    onChange={handleFormChange}
                                />
                            </Form.Group>
                        </Col>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeviceModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleDeviceUpdate}>
                        {selectedDevice ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Report Modal */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Générer un rapport</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Type de rapport</Form.Label>
                            <Form.Select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="usage">Utilisation des appareils</option>
                                <option value="energy">Consommation énergétique</option>
                                <option value="users">Activité des utilisateurs</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Format d'export</Form.Label>
                            <div>
                                <Form.Check
                                    inline
                                    label="CSV"
                                    name="exportFormat"
                                    type="radio"
                                    id="csv-format"
                                    checked={exportFormat === 'csv'}
                                    onChange={() => setExportFormat('csv')}
                                />
                                <Form.Check
                                    inline
                                    label="PDF"
                                    name="exportFormat"
                                    type="radio"
                                    id="pdf-format"
                                    checked={exportFormat === 'pdf'}
                                    onChange={() => setExportFormat('pdf')}
                                />
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleGenerateReport}>
                        Générer le rapport
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="security-content">
                    <h2 className="admin-title mb-4">Paramètres de sécurité</h2>

                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Journal des accès</Card.Title>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Utilisateur</th>
                                        <th>Action</th>
                                        <th>Adresse IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>2023-05-15 14:30</td>
                                        <td>admin</td>
                                        <td>Connexion</td>
                                        <td>192.168.1.10</td>
                                    </tr>
                                    <tr>
                                        <td>2023-05-15 10:15</td>
                                        <td>prof1</td>
                                        <td>Modification appareil</td>
                                        <td>192.168.1.15</td>
                                    </tr>
                                    <tr>
                                        <td>2023-05-14 16:45</td>
                                        <td>admin</td>
                                        <td>Ajout utilisateur</td>
                                        <td>192.168.1.10</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    <Row>
                        <Col md={6}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>Paramètres de mot de passe</Card.Title>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Complexité minimale</Form.Label>
                                            <Form.Select>
                                                <option>Faible (6 caractères)</option>
                                                <option selected>Moyenne (8 caractères)</option>
                                                <option>Forte (12 caractères avec symboles)</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                label="Expiration des mots de passe (90 jours)"
                                                checked
                                            />
                                        </Form.Group>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Sauvegarde des données</Card.Title>
                                    <div className="mb-3">
                                        <Button variant="outline-primary" className="me-2">
                                            <FaDatabase className="me-2" />
                                            Sauvegarder maintenant
                                        </Button>
                                        <Button variant="outline-secondary">
                                            Planifier une sauvegarde
                                        </Button>
                                    </div>
                                    <div className="backup-list">
                                        <div className="backup-item">
                                            <span className="backup-date">2023-05-14 02:00</span>
                                            <Button variant="link" size="sm">Télécharger</Button>
                                        </div>
                                        <div className="backup-item">
                                            <span className="backup-date">2023-05-07 02:00</span>
                                            <Button variant="link" size="sm">Télécharger</Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}

            {/* Classes Tab */}
            {activeTab === 'classes' && (
                <div className="classes-content">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="admin-title">Gestion des classes</h2>
                        <Button variant="primary" onClick={() => navigate('/admin/add-class')}>
                            <FaPlus className="me-2" />
                            Ajouter une classe
                        </Button>
                    </div>

                    <Row>
                        {dashboardData.classes.map(classe => (
                            <Col key={classe.id} md={4} className="mb-4">
                                <Card className="h-100">
                                    <Card.Body>
                                        <Card.Title>{classe.name}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            Professeur: {classe.teacherName}
                                        </Card.Subtitle>
                                        <div className="class-stats">
                                            <div className="stat-item">
                                                <span className="stat-label">Élèves:</span>
                                                <span className="stat-value">{classe.studentCount}</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Appareils:</span>
                                                <span className="stat-value">{classe.deviceCount}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                    <Card.Footer className="bg-transparent">
                                        <Button variant="outline-primary" size="sm" className="me-2">
                                            <FaEdit /> Modifier
                                        </Button>
                                        <Button variant="outline-danger" size="sm">
                                            <FaTrash /> Supprimer
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <div className="announcements-content">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="admin-title">Gestion des annonces</h2>
                        <Button variant="primary" onClick={() => navigate('/admin/add-announcement')}>
                            <FaPlus className="me-2" />
                            Créer une annonce
                        </Button>
                    </div>

                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Titre</th>
                                <th>Date</th>
                                <th>Auteur</th>
                                <th>Urgent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.announcements.map(announcement => (
                                <tr key={announcement.id}>
                                    <td>{announcement.title}</td>
                                    <td>{new Date(announcement.date).toLocaleDateString()}</td>
                                    <td>{announcement.author}</td>
                                    <td>
                                        {announcement.urgent ? (
                                            <Badge bg="danger">Oui</Badge>
                                        ) : (
                                            <Badge bg="secondary">Non</Badge>
                                        )}
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
                </div>
            )}

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir rejeter (supprimer) cet utilisateur ? Cette action est irréversible.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            await handleDeleteUser(userToDelete);
                            setShowConfirmModal(false);
                            setUserToDelete(null);
                        }}
                    >
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="events-content">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="admin-title">Gestion des événements</h2>
                        <Button variant="primary" onClick={() => navigate('/admin/add-event')}>
                            <FaPlus className="me-2" />
                            Ajouter un événement
                        </Button>
                    </div>

                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Titre</th>
                                <th>Date</th>
                                <th>Lieu</th>
                                <th>Participants</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.events.map(event => (
                                <tr key={event.id}>
                                    <td>{event.title}</td>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td>{event.location}</td>
                                    <td>{event.participants}</td>
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
                </div>
            )}

            {/* Toast Notifications */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg="success"
                >
                    <Toast.Header>
                        <strong className="me-auto">Notification</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default AdminDashboard;
