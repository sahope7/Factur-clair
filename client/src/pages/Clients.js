import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ice: '',
  });

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    try {
      const response = await getClients(search);
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await createClient(formData);
      }
      setShowModal(false);
      resetForm();
      loadClients();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom || '',
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      ice: client.ice || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteClient(id);
        loadClients();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      ice: '',
    });
    setEditingClient(null);
  };

  return (
    <Layout>
      <div className="clients-page">
        <div className="page-header">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Nouveau Client
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="clients-grid">
            {clients.map((client) => (
              <div key={client.id} className="client-card">
                <div className="client-header">
                  <h3>{client.nom}</h3>
                  <div className="client-actions">
                    <button
                      className="icon-btn"
                      onClick={() => handleEdit(client)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(client.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="client-info">
                  {client.email && (
                    <p>
                      <strong>Email:</strong> {client.email}
                    </p>
                  )}
                  {client.telephone && (
                    <p>
                      <strong>Téléphone:</strong> {client.telephone}
                    </p>
                  )}
                  {client.adresse && (
                    <p>
                      <strong>Adresse:</strong> {client.adresse}
                    </p>
                  )}
                  {client.ice && (
                    <p>
                      <strong>ICE:</strong> {client.ice}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingClient ? 'Modifier' : 'Nouveau'} Client</h2>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <textarea
                    value={formData.adresse}
                    onChange={(e) =>
                      setFormData({ ...formData, adresse: e.target.value })
                    }
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>ICE</label>
                  <input
                    type="text"
                    value={formData.ice}
                    onChange={(e) =>
                      setFormData({ ...formData, ice: e.target.value })
                    }
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingClient ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
