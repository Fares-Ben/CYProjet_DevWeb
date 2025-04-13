import React, { useState, useEffect, useCallback } from 'react';
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
import PropTypes from 'prop-types';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deviceSearchTerm, setDeviceSearchTerm] = useState('');

    // États pour les données
    const [dashboardData, setDashboardData] = useState({
        users: [],
        pendingUsers: [],
        devices: [],
        announcements: [],
        events: [],
        activityLogs: [],
        stats: {
            totalUsers: 0,
            activeDevices: 0,
            inactiveDevices: 0,
            maintenanceDevices: 0,
            totalEvents: 0,
            pendingRequests: 0,
            energyConsumption: 0,
            waterConsumption: 0,
            usageStats: [],
            monthlyComparison: {
                energy: 0,
                users: 0,
                devices: 0
            }
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
    const [toastVariant, setToastVariant] = useState('success');
    const [reportType, setReportType] = useState('usage');
    const [exportFormat, setExportFormat] = useState('csv');
    const [filters, setFilters] = useState({ type: '', status: '', location: '' });
    const [showFormError, setShowFormError] = useState(false);

    // Fonctions utilitaires
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        urgent: false,
        date: '',
        author: 'Admin',
    });
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const handleAnnouncementChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAnnouncementForm({
            ...announcementForm,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleEditClick = (announcement) => {
        setSelectedAnnouncement(announcement);
        setAnnouncementForm({
            title: announcement.title,
            content: announcement.content,
            urgent: announcement.urgent,
            date: announcement.date.split('T')[0], // format YYYY-MM-DD
            author: announcement.author,
        });
        setShowAnnouncementModal(true);
    };

    const handleDeleteClick = (announcementId) => {
        setAnnouncementToDelete(announcementId);
        setShowConfirmModal(true);
    };

    const formatRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'il y a quelques secondes';
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} minutes`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} heures`;
        return `le ${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const showNotification = (message, variant = 'success') => {
        setToastMessage(message);
        setToastVariant(variant);
        setShowToast(true);
    };

    // Gestion des données
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const [
                usersRes,
                pendingRes,
                devicesRes,
                announcementsRes,
                eventsRes,
                statsRes,
                activityRes
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/users`, { headers }),
                axios.get(`${API_BASE_URL}/admin/pending-users`, { headers }),
                axios.get(`${API_BASE_URL}/smart-devices`, { headers }),
                axios.get(`${API_BASE_URL}/announcements`, { headers }),
                axios.get(`${API_BASE_URL}/events`, { headers }),
                axios.get(`${API_BASE_URL}/admin/stats`, { headers }),
                axios.get(`${API_BASE_URL}/admin/users-activity`, { headers })
            ]);

            setDashboardData({
                users: usersRes.data,
                pendingUsers: pendingRes.data,
                devices: devicesRes.data,
                announcements: announcementsRes.data,
                events: eventsRes.data,
                stats: {
                    ...statsRes.data,
                    activeDevices: devicesRes.data.filter(d => d.etat === 'actif').length,
                    inactiveDevices: devicesRes.data.filter(d => d.etat === 'inactif').length,
                    maintenanceDevices: devicesRes.data.filter(d => d.etat === 'maintenance').length,
                    totalEvents: eventsRes.data.length,
                    totalAnnouncements: announcementsRes.data.length,
                    pendingRequests: pendingRes.data.length,
                    totalUsers: usersRes.data.length
                },
                activityLogs: activityRes.data
            });

            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || err.message);
            setIsLoading(false);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Gestion des utilisateurs
    const handleValidateUser = async (userId, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/admin/validate-user/${userId}`,
                { action },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const [usersRes, pendingRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/admin/pending-users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
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

            showNotification(`Utilisateur ${action === 'validate' ? 'validé' : 'rejeté'} avec succès`);
        } catch (err) {
            console.error('Error validating user:', err);
            showNotification(err.response?.data?.message || 'Erreur lors de la validation', 'danger');
        }
    };

    const confirmDeleteUser = (userId) => {
        setUserToDelete(userId);
        setShowConfirmModal(true);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_BASE_URL}/admin/delete-user/${userId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setDashboardData(prev => ({
                ...prev,
                users: prev.users.filter(user => user.id !== userId),
                pendingUsers: prev.pendingUsers.filter(user => user.id !== userId),
                stats: {
                    ...prev.stats,
                    totalUsers: prev.users.some(u => u.id === userId) ? prev.stats.totalUsers - 1 : prev.stats.totalUsers,
                    pendingRequests: prev.pendingUsers.some(u => u.id === userId) ? prev.stats.pendingRequests - 1 : prev.stats.pendingRequests
                }
            }));

            showNotification('Utilisateur supprimé avec succès');
        } catch (err) {
            console.error('Error deleting user:', err);
            showNotification(err.response?.data?.message || 'Erreur lors de la suppression', 'danger');
        } finally {
            setShowConfirmModal(false);
            setUserToDelete(null);
        }
    };

    const handleUpdateUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const userToUpdate = {
                ...selectedUser,
                validated: selectedUser.validated ? 1 : 0
            };

            await axios.put(
                `${API_BASE_URL}/admin/users/${selectedUser.id}`,
                userToUpdate,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (selectedUser.newPassword) {
                await axios.post(
                    `${API_BASE_URL}/admin/update-password/${selectedUser.id}`,
                    { newPassword: selectedUser.newPassword },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            }

            const [usersRes, pendingRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/admin/pending-users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
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

            setShowUserModal(false);
            showNotification('Utilisateur mis à jour avec succès');
        } catch (err) {
            console.error('Error updating user:', err);
            showNotification(err.response?.data?.message || 'Erreur lors de la mise à jour', 'danger');
        }
    };


    const handleUpdateAnnouncement = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/admin/announcements/${selectedAnnouncement.id}`, announcementForm, {
                headers: { Authorization: `Bearer ${token}` },
            });


            const announcementsRes = await axios.get(
                `${API_BASE_URL}/announcements`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setShowAnnouncementModal(false);
            setDashboardData(prev => ({
                ...prev,
                announcements: announcementsRes.data,
            }));

            // refresh data
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
        }
    };

    /* const handleConfirmDelete = async () => {
    try {
          const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/admin/announcements/${announcementToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowConfirmModal(false);
            setAnnouncementToDelete(null);


        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    }; */

    const handleConfirmDelete = async (announcementId) => {
        try {
            const token = localStorage.getItem('token');

            // Supprimer l'événement
            await axios.delete(`${API_BASE_URL}/admin/announcements/${announcementToDelete}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Récupérer les événements après suppression
            const announcementsRes = await axios.get(`${API_BASE_URL}/admin/announcements`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Mettre à jour l'état avec les événements actualisés
            setDashboardData(prev => ({
                ...prev,
                announcements: announcementsRes.data,
                stats: {
                    ...prev.stats,
                    totalAnnouncements: announcementsRes.data.length,  // Mettre à jour le nombre d'événements
                }
            }));

            // Afficher une notification de succès
            showNotification('Annonce supprimée avec succès');

        } catch (error) {
            console.error("Erreur lors de la suppression de l'annonce :", error);
            // Afficher une notification d'erreur
            showNotification(error.response?.data?.message || 'Erreur lors de la suppression de l\'annonce', 'danger');
        }
    };



    // Gestion des appareils
    const handleDeviceUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!deviceForm.name || !deviceForm.type || !deviceForm.location) {
                setShowFormError(true);
                return;
            }

            if (selectedDevice) {
                await axios.put(
                    `${API_BASE_URL}/admin/devices/${selectedDevice.id}`,
                    deviceForm,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${API_BASE_URL}/admin/post-devices`,
                    deviceForm,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            }

            const devicesRes = await axios.get(
                `${API_BASE_URL}/admin/devices`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setDashboardData(prev => ({
                ...prev,
                devices: devicesRes.data,
                stats: {
                    ...prev.stats,
                    activeDevices: devicesRes.data.filter(d => d.etat === 'actif').length,
                    inactiveDevices: devicesRes.data.filter(d => d.etat === 'inactif').length,
                    maintenanceDevices: devicesRes.data.filter(d => d.etat === 'maintenance').length
                }
            }));

            setShowDeviceModal(false);
            showNotification(`Appareil ${selectedDevice ? 'mis à jour' : 'ajouté'} avec succès`);
        } catch (err) {
            console.error('Error updating device:', err);
            showNotification(err.response?.data?.message || 'Erreur lors de la mise à jour', 'danger');
        }
    };

    const handleDeviceDelete = async (deviceId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_BASE_URL}/admin/devices/${deviceId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const devicesRes = await axios.get(
                `${API_BASE_URL}/admin/devices`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setDashboardData(prev => ({
                ...prev,
                devices: devicesRes.data,
                stats: {
                    ...prev.stats,
                    activeDevices: devicesRes.data.filter(d => d.etat === 'actif').length,
                    inactiveDevices: devicesRes.data.filter(d => d.etat === 'inactif').length,
                    maintenanceDevices: devicesRes.data.filter(d => d.etat === 'maintenance').length
                }
            }));

            showNotification('Appareil supprimé avec succès');
        } catch (err) {
            console.error('Error deleting device:', err);
            showNotification(err.response?.data?.message || 'Erreur lors de la suppression', 'danger');
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
            if (reportType === 'energy') {
                a.download = `rapport_sur_consommation.${exportFormat}`;
            } else if (reportType === 'usage') {
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
            consommation: device.consommation || 0
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

    const handleSubmit = () => {
        if (!deviceForm.name || !deviceForm.type || !deviceForm.location) {
            setShowFormError(true);
            return;
        }
        setShowFormError(false);
        handleDeviceUpdate();
    };


    // Filtrage des données
    const filteredUsers = (dashboardData?.users || []).filter(user =>
        user?.pseudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Et ajouter en haut de votre composant :
    if (!dashboardData || !dashboardData.devices) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const filteredDevices = dashboardData.devices.filter(device => {
        if (!device) return false;

        // Filtre de recherche textuelle
        const searchLower = deviceSearchTerm.toLowerCase();
        const textMatch =
            (device.name?.toLowerCase() || '').includes(searchLower) ||
            (device.type?.toLowerCase() || '').includes(searchLower) ||
            (device.location?.toLowerCase() || '').includes(searchLower) ||
            (device.status?.toLowerCase() || '').includes(searchLower);

        // Filtres supplémentaires
        const typeMatch = !filters.type || device.type === filters.type;
        const statusMatch = !filters.status || device.etat === filters.status;
        const locationMatch = !filters.location || device.location === filters.location;

        return textMatch && typeMatch && statusMatch && locationMatch;
    });



    // Calcul des pourcentages pour les ProgressBar
    const activeDevicesPercent = dashboardData.devices.length > 0 ?
        (dashboardData.stats.activeDevices / dashboardData.devices.length) * 100 : 0;
    const maintenanceDevicesPercent = dashboardData.devices.length > 0 ?
        (dashboardData.stats.maintenanceDevices / dashboardData.devices.length) * 100 : 0;
    const inactiveDevicesPercent = dashboardData.devices.length > 0 ?
        (dashboardData.stats.inactiveDevices / dashboardData.devices.length) * 100 : 0;

    // Affichage du loading
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
                <Button variant="outline-danger" className="ms-3" onClick={fetchData}>
                    Réessayer
                </Button>
            </Alert>
        );
    }

    // Affichage des erreurs
    if (error) {
        return (
            <Alert variant="danger" className="m-4">
                Erreur lors du chargement des données: {error}
                <Button variant="outline-danger" className="ms-3" onClick={fetchData}>
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
                <button
                    className="mobile-menu-toggle d-lg-none"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    aria-label="Toggle menu"
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
                                        <div className="stat-value">{dashboardData?.stats?.totalUsers || 0}</div>
                                        <div className="stat-change">
                                            <span className={
                                                (dashboardData?.stats?.monthlyComparison?.users ?? 0) >= 0
                                                    ? "text-success"
                                                    : "text-danger"
                                            }>
                                                {(dashboardData?.stats?.monthlyComparison?.users ?? 0) >= 0 ? '↑' : '↓'}
                                                {Math.abs(dashboardData?.stats?.monthlyComparison?.users ?? 0)}%
                                            </span>
                                            ce mois-ci
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
                                        <div className="stat-value">{dashboardData?.stats?.activeDevices || 0}</div>
                                        <div className="stat-change">
                                            <span className={
                                                (dashboardData?.stats?.monthlyComparison?.devices ?? 0) >= 0
                                                    ? "text-success"
                                                    : "text-danger"
                                            }>
                                                {(dashboardData?.stats?.monthlyComparison?.devices ?? 0) >= 0 ? '↑' : '↓'}
                                                {Math.abs(dashboardData?.stats?.monthlyComparison?.devices ?? 0)}%
                                            </span>
                                            ce mois-ci
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
                                        <Card.Title>Événements</Card.Title>
                                        <div className="stat-value">{dashboardData.stats.totalEvents}</div>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button variant="link" onClick={() => setActiveTab('events')}>
                                            Voir les événements
                                        </Button>
                                    </Card.Footer>
                                </Card>

                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <FaUserCheck />
                                        </div>
                                        <Card.Title>Demandes en attente</Card.Title>
                                        <div className="stat-value">{dashboardData.stats.pendingRequests}</div>
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
                                        <ProgressBar
                                            now={Math.min(100, dashboardData.stats.energyConsumption / 1000 * 100)}
                                            label={`${Math.round(dashboardData.stats.energyConsumption / 1000 * 100)}%`}
                                            variant="warning"
                                            className="mb-3"
                                        />
                                        <div className="energy-comparison">
                                            <span className={
                                                (dashboardData?.stats?.monthlyComparison?.energy ?? 0) >= 0
                                                    ? "text-danger"
                                                    : "text-success"
                                            }>
                                                {(dashboardData?.stats?.monthlyComparison?.energy ?? 0) >= 0 ? '↑' : '↓'}
                                                {Math.abs(dashboardData?.stats?.monthlyComparison?.energy ?? 0)}%
                                            </span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Recent Activity */}
                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <Card.Title>Activités récentes</Card.Title>
                                            <div className="activity-list">
                                                {dashboardData.activityLogs.slice(0, 5).map((activity, index) => (
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
                                                    {dashboardData.devices
                                                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                                        .slice(0, 5)
                                                        .map(device => (
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
                                <Button variant="primary" onClick={() => navigate('/admindashboard/addUser')}>
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
                                                        <ProgressBar now={user.points} label={user.points} />
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => {
                                                                setSelectedUser({
                                                                    ...user,
                                                                    newPassword: ''
                                                                });
                                                                setShowUserModal(true);
                                                            }}
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
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
                                                            </Button>
                                                            <Button
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
                                                {dashboardData.devices.length > 0 ? (
                                                    <>
                                                        <ProgressBar className="mb-2">
                                                            <ProgressBar
                                                                variant="primary"
                                                                now={(dashboardData.devices.filter(d => d.type === 'tableau').length / dashboardData.devices.length) * 100}
                                                                key={1}
                                                                label={`Tableaux (${dashboardData.devices.filter(d => d.type === 'tableau').length})`}
                                                            />
                                                        </ProgressBar>
                                                        <ProgressBar className="mb-2">
                                                            <ProgressBar
                                                                variant="success"
                                                                now={(dashboardData.devices.filter(d => d.type === 'climatisation').length / dashboardData.devices.length) * 100}
                                                                key={2}
                                                                label={`Climatisation (${dashboardData.devices.filter(d => d.type === 'climatisation').length})`}
                                                            />
                                                        </ProgressBar>
                                                        <ProgressBar className="mb-2">
                                                            <ProgressBar
                                                                variant="info"
                                                                now={(dashboardData.devices.filter(d => d.type === 'securite').length / dashboardData.devices.length) * 100}
                                                                key={3}
                                                                label={`Sécurité (${dashboardData.devices.filter(d => d.type === 'securite').length})`}
                                                            />
                                                        </ProgressBar>
                                                        <ProgressBar>
                                                            <ProgressBar
                                                                variant="secondary"
                                                                now={(dashboardData.devices.filter(d => !['tableau', 'climatisation', 'securite'].includes(d.type)).length / dashboardData.devices.length) * 100}
                                                                key={4}
                                                                label={`Autre (${dashboardData.devices.filter(d => !['tableau', 'climatisation', 'securite'].includes(d.type)).length})`}
                                                            />
                                                        </ProgressBar>
                                                    </>
                                                ) : (
                                                    <Alert variant="info">Aucun appareil enregistré</Alert>
                                                )}
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
                                                    <ProgressBar
                                                        now={activeDevicesPercent}
                                                        label={`${dashboardData.stats.activeDevices}`}
                                                        variant="success"
                                                    />
                                                </div>
                                                <div className="status-item">
                                                    <div className="status-label">Maintenance</div>
                                                    <ProgressBar
                                                        now={maintenanceDevicesPercent}
                                                        label={`${dashboardData.stats.maintenanceDevices}`}
                                                        variant="warning"
                                                    />
                                                </div>
                                                <div className="status-item">
                                                    <div className="status-label">Inactifs</div>
                                                    <ProgressBar
                                                        now={inactiveDevicesPercent}
                                                        label={`${dashboardData.stats.inactiveDevices}`}
                                                        variant="secondary"
                                                    />
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
                                                <Button
                                                    variant="outline-info"
                                                    className="w-100"
                                                    onClick={() => setActiveTab('stats')}
                                                >
                                                    <FaChartPie className="me-2" />
                                                    Voir statistiques
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* barre de recherche */}
                            <Card className="mb-4">
                                <Card.Body>
                                    <Form.Group>
                                        <Form.Label>
                                            <FaSearch className="me-2" />
                                            Rechercher un appareil
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher par nom, type, localisation..."
                                            value={deviceSearchTerm}
                                            onChange={(e) => setDeviceSearchTerm(e.target.value)}
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* Barre de filtres */}
                            <Card className="mb-4 filter-card">
                                <Card.Body>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Type d'appareil</Form.Label>
                                                <Form.Select
                                                    value={filters.type}
                                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                                >
                                                    <option value="">Tous les types</option>
                                                    <option value="tableau">Tableau interactif</option>
                                                    <option value="climatisation">Climatisation</option>
                                                    <option value="securite">Sécurité</option>
                                                    <option value="imprimante">Imprimante</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Statut</Form.Label>
                                                <Form.Select
                                                    value={filters.status}
                                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                                >
                                                    <option value="">Tous les statuts</option>
                                                    <option value="actif">Actif</option>
                                                    <option value="maintenance">Maintenance</option>
                                                    <option value="inactif">Inactif</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Localisation</Form.Label>
                                                <Form.Select
                                                    value={filters.location}
                                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                                >
                                                    <option value="">Toutes les localisations</option>
                                                    {[...new Set(dashboardData.devices.map(d => d.location))].map(loc => (
                                                        <option key={loc} value={loc}>{loc}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    {Object.values(filters).some(Boolean) && (
                                        <div className="mt-3 text-end">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => setFilters({ type: '', status: '', location: '' })}
                                            >
                                                Réinitialiser
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nom</th>
                                        <th>Type</th>
                                        <th>Localisation</th>
                                        <th>Statut</th>
                                        <th>Consommation (kWh)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDevices.map(device => (
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
                                            <td>{device.consommation || 'N/A'}</td>
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
                                                    onClick={() => {
                                                        setUserToDelete(device.id);
                                                        setShowConfirmModal(true);
                                                    }}
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
                                                    <div className="chart-container">
                                                        <canvas id="userActivityChart"></canvas>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Card.Title>Utilisation des appareils</Card.Title>
                                                    <div className="chart-container">
                                                        <canvas id="deviceUsageChart"></canvas>
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
                                                                <th>Action</th>
                                                                <th>Adresse IP</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dashboardData.activityLogs.slice(0, 10).map((log, index) => (
                                                                <tr key={index}>
                                                                    <td>{new Date(log.date).toLocaleString()}</td>
                                                                    <td>{log.pseudo}</td>
                                                                    <td>{log.type}</td>
                                                                    <td>{log.ip || 'N/A'}</td>
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
                                                    <div className="chart-container">
                                                        <canvas id="energyConsumptionChart"></canvas>
                                                    </div>
                                                    <div className="resource-details mt-3">
                                                        <div className="resource-item">
                                                            <span className="resource-label">Total ce mois-ci:</span>
                                                            <span className="resource-value">{dashboardData.stats.energyConsumption} kWh</span>
                                                        </div>
                                                        <div className="resource-item">
                                                            <span className="resource-label">Économies:</span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Card.Title>Consommation d'eau</Card.Title>
                                                    <div className="chart-container">
                                                        <canvas id="waterConsumptionChart"></canvas>
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
                                            {dashboardData.activityLogs
                                                .filter(log => ['login', 'logout', 'password_change'].includes(log.type))
                                                .slice(0, 10)
                                                .map((log, index) => (
                                                    <tr key={index}>
                                                        <td>{new Date(log.date).toLocaleString()}</td>
                                                        <td>{log.pseudo}</td>
                                                        <td>
                                                            {log.type === 'login' ? 'Connexion' :
                                                                log.type === 'logout' ? 'Déconnexion' :
                                                                    'Changement mot de passe'}
                                                        </td>
                                                        <td>{log.ip || 'N/A'}</td>
                                                    </tr>
                                                ))}
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
                                                {dashboardData.activityLogs
                                                    .filter(log => log.type === 'backup')
                                                    .slice(0, 2)
                                                    .map((log, index) => (
                                                        <div key={index} className="backup-item">
                                                            <span className="backup-date">
                                                                {new Date(log.date).toLocaleString()}
                                                            </span>
                                                            <Button variant="link" size="sm">Télécharger</Button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Announcements Tab */}
                    {activeTab === 'announcements' && (
                        <div className="announcements-content">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="admin-title">Gestion des annonces</h2>
                                <Button variant="primary" onClick={() => navigate('/admindashboard/addAnnouncement')}>
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

                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditClick(announcement)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(announcement.id)}
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

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div className="events-content">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="admin-title">Gestion des événements</h2>
                                <Button variant="primary" onClick={() => navigate('/admindashboard/addEvent')}>
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
                                            type="email"
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
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nouveau mot de passe</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={selectedUser.newPassword || ''}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                newPassword: e.target.value
                                            })}
                                            placeholder="Laisser vide pour ne pas changer"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date de naissance</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={selectedUser.date_naissance ? formatDateForInput(selectedUser.date_naissance) : ''}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                date_naissance: e.target.value
                                            })}
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
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Statut</Form.Label>
                                        <div className="d-flex align-items-center">
                                            <Form.Check
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
                                            min="0"
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
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            {selectedUser.last_connexion
                                                ? `Dernière connexion : ${new Date(selectedUser.last_connexion).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZone: 'Europe/Paris',
                                                    hour12: false
                                                })}`
                                                : 'Dernière connexion : Jamais connecté'}
                                        </Form.Label>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            {selectedUser.date_inscription
                                                ? `Date d'inscription : ${new Date(selectedUser.date_inscription).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZone: 'Europe/Paris',
                                                    hour12: false
                                                })}`
                                                : "Date d'inscription : Inconnue"}
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


            <Modal show={showAnnouncementModal} onHide={() => setShowAnnouncementModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Modifier l’annonce</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Titre</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={announcementForm.title}
                                onChange={handleAnnouncementChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Contenu</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="content"
                                rows={4}
                                value={announcementForm.content}
                                onChange={handleAnnouncementChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={announcementForm.date}
                                onChange={handleAnnouncementChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="urgentCheckbox">
                            <Form.Check
                                type="checkbox"
                                label="Urgent"
                                name="urgent"
                                checked={announcementForm.urgent}
                                onChange={handleAnnouncementChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleUpdateAnnouncement}>
                        Mettre à jour
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* Device Modal */}
            <Modal show={showDeviceModal} onHide={() => {
                setShowDeviceModal(false);
                setShowFormError(false);
            }} size="lg">
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
                                        required
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
                                        required
                                    >
                                        <option value="">Sélectionner un type</option>
                                        <option value="tableau">Tableau interactif</option>
                                        <option value="climatisation">Climatisation</option>
                                        <option value="securite">Système de sécurité</option>
                                        <option value="eclairage">Éclairage intelligent</option>
                                        <option value="capteur">Capteur</option>
                                        <option value="alarme">Alarme - Détecteur de fumée</option>
                                        <option value="autre">Autre</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Localisation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={deviceForm.location}
                                        onChange={handleFormChange}
                                        placeholder="Salle B12, Cour principale..."
                                        required
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
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Consommation (en kWh)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="consommation"
                                        min="0"
                                        step="0.1"
                                        value={deviceForm.consommation}
                                        onChange={handleFormChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                {showFormError && (
                    <Alert variant="danger" className="m-3">
                        Veuillez remplir tous les champs obligatoires
                    </Alert>
                )}
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowDeviceModal(false);
                        setShowFormError(false);
                    }}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
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

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            if (activeTab === 'users') {
                                await handleDeleteUser(userToDelete);
                            } else if (activeTab === 'devices') {
                                await handleDeviceDelete(userToDelete);
                            }
                            setShowConfirmModal(false);
                            setUserToDelete(null);
                        }}
                    >
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast Notifications */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={5000}
                    autohide
                    bg={toastVariant}
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

AdminDashboard.propTypes = {
    location: PropTypes.shape({
        state: PropTypes.object
    })
};

export default AdminDashboard;