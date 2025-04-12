import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  // Nouveau state pour gérer l'édition

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

  // Fonction pour gérer la mise à jour des données utilisateur
  const handleUpdate = async (updatedUserInfo) => {
    const token = localStorage.getItem('token');  // Récupérer le token depuis le localStorage

    if (token) {
      try {
        const response = await fetch(`http://localhost:3001/api/profiles/${updatedUserInfo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUserInfo),  // Les nouvelles informations de l'utilisateur
        });

        const data = await response.json();

        if (response.ok) {
          alert('Informations mises à jour avec succès');
          // Mettre à jour l'état local avec les nouvelles données
          setUserInfo(data);
          setIsEditing(false);  // Fermer le mode édition après la mise à jour
        } else {
          alert(data.message || 'Erreur lors de la mise à jour');
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour :', err);
      }
    }
  };

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
              {isEditing ? (
                // Formulaire pour modifier les données
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(userInfo); }}>
                  <div>
                    <label>Nom</label>
                    <input
                      type="text"
                      value={userInfo.nom}
                      onChange={(e) => setUserInfo({ ...userInfo, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Prénom</label>
                    <input
                      type="text"
                      value={userInfo.prenom}
                      onChange={(e) => setUserInfo({ ...userInfo, prenom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    />
                  </div>
                  <button type="submit">Enregistrer</button>
                </form>
              ) : (
                // Affichage des informations si pas en mode édition
                <>
                  <p><strong>Nom :</strong> {userInfo.nom}</p>
                  <p><strong>Prénom :</strong> {userInfo.prenom}</p>
                  <p><strong>Date de naissance :</strong> {new Date(userInfo.date_naissance).toLocaleDateString()}</p>
                  <p><strong>Fonction :</strong> {userInfo.fonction}</p>
                  <p><strong>Email :</strong> {userInfo.email}</p>
                  <p><strong>Pseudo :</strong> {userInfo.pseudo}</p>
                  <button onClick={() => setIsEditing(true)}>Modifier</button>
                </>
              )}
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
