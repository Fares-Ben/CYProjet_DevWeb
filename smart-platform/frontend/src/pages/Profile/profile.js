import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert
} from 'react-bootstrap';
const API_BASE_URL = 'http://localhost:3001/api';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [formData, setFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [modeEdition, setModeEdition] = useState(false);

  const handleCancel = () => {
    setFormData(userData);       // on remet les anciennes valeurs
    setNewPassword('');          // on vide le champ mot de passe
    setModeEdition(false);       // on sort du mode édition
    setMessage(null);            // on efface les messages
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUserData(res.data);
      setFormData(res.data);
    }).catch(() => navigate('/login')); // en cas de token invalide
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE_URL}/profile/update`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (formData.newPassword) {
        await axios.put(`${API_BASE_URL}/profile/update-password`, {
          newPassword: formData.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });

      setModeEdition(false);       // on sort du mode édition
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erreur lors de la mise à jour' });
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow rounded-4 p-4 border-0">
            <h2 className="mb-4 text-center">Mon Profil</h2>

            {message && (
              <Alert variant={message.type}>{message.text}</Alert>
            )}

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  name="nom"
                  value={formData.nom || ''}
                  onChange={handleChange}
                  disabled={!modeEdition}

                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  name="prenom"
                  value={formData.prenom || ''}
                  onChange={handleChange}
                  disabled={!modeEdition}

                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email (non-modifible), se tourner vers un admin pour modifier</Form.Label>
                <Form.Control
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  type="email"
                  disabled={1}

                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pseudo (non-modifible), se tourner vers un admin pour modifier</Form.Label>
                <Form.Control
                  name="pseudo"
                  value={formData.pseudo || ''}
                  onChange={handleChange}
                  disabled={1}

                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nouveau mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Laisser vide si inchangé"
                  disabled={!modeEdition}
                />
              </Form.Group>
              <hr className="my-4" />
              <h5 className="text-muted">Informations système</h5>

              <Form.Group className="mb-3">
                <Form.Label>ID utilisateur</Form.Label>
                <Form.Control value={userData.id || ''} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fonction</Form.Label>
                <Form.Control value={userData.fonction || ''} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Niveau</Form.Label>
                <Form.Control value={userData.niveau || ''} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Points</Form.Label>
                <Form.Control value={userData.points || 0} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date de naissance</Form.Label>
                <Form.Control
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance?.substring(0, 10) || ''}
                  onChange={handleChange}
                  disabled={!modeEdition}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date d'inscription</Form.Label>
                <Form.Control value={userData.date_inscription?.replace('T', ' ').substring(0, 19) || ''} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dernière connexion</Form.Label>
                <Form.Control value={userData.last_connexion?.replace('T', ' ').substring(0, 19) || ''} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre de connexions</Form.Label>
                <Form.Control value={userData.nb_connexions || 0} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre d'actions</Form.Label>
                <Form.Control value={userData.nb_actions || 0} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email vérifié</Form.Label>
                <Form.Control value={userData.email_verified ? "Oui" : "Non"} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Statut de validation</Form.Label>
                <Form.Control value={userData.validated ? "Validé" : "En attente"} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Thème préféré</Form.Label>
                <Form.Control value={userData.theme_prefere || 'light'} disabled />
              </Form.Group>



              {modeEdition ? (
                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={handleCancel}>
                    Annuler
                  </Button>
                  <Button variant="success" onClick={handleSave}>
                    Enregistrer
                  </Button>
                </div>
              ) : (
                <div className="d-grid">
                  <Button variant="primary" size="lg" onClick={() => setModeEdition(true)}>
                    Modifier mon profil
                  </Button>
                </div>
              )}


            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;