import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');  // Récupérer le token du localStorage
  console.log('Token récupéré :', token);

  useEffect(() => {
    if (token) {
      const fetchUserInfo = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/profiles', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('Status de la réponse :', response.status);

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Non autorisé. Token invalide ou expiré.');
            }
            throw new Error('Erreur lors de la récupération des données.');
          }

          const data = await response.json(); // Parse directement en JSON
          console.log('Réponse JSON :', data);
          setUserInfo(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserInfo();
    }
  }, [token]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Profil de l'utilisateur</h1>
      {userInfo ? (
        <div>
          <div className="row">
            <div className="col-md-4">
              {userInfo.photo && <img src={userInfo.photo} alt={userInfo.pseudo || "Utilisateur"} className="img-fluid rounded-circle" />}
            </div>
            <div className="col-md-8">
              <p><strong>Nom :</strong> {userInfo.nom}</p>
              <p><strong>Prénom :</strong> {userInfo.prenom}</p>
              <p><strong>Date de naissance :</strong> {new Date(userInfo.date_naissance).toLocaleDateString()}</p>
              <p><strong>Fonction :</strong> {userInfo.fonction}</p>
              <p><strong>Email :</strong> {userInfo.email}</p>
              <p><strong>Pseudo :</strong> {userInfo.pseudo}</p>
              <p><strong>Niveau :</strong> {userInfo.niveau}</p>
              <p><strong>Points :</strong> {userInfo.points}</p>
              <p><strong>Dernière connexion :</strong> {new Date(userInfo.last_connexion).toLocaleString()}</p>
              <p><strong>Nombre de connexions :</strong> {userInfo.nb_connexions}</p>
              <p><strong>Nombre d'actions :</strong> {userInfo.nb_actions}</p>
              <p><strong>Thème préféré :</strong> {userInfo.theme_prefere}</p>
              <p><strong>Date d'inscription :</strong> {new Date(userInfo.date_inscription).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Aucune information trouvée.</p>
      )}
    </div>
  );
};

export default Profile;
