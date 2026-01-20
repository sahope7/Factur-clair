import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  getProduits,
  createProduit,
  updateProduit,
  deleteProduit,
} from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import './Produits.css';

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    tva: '20',
  });

  const loadProduits = useCallback(async () => {
    try {
      const response = await getProduits(search);
      setProduits(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadProduits();
  }, [loadProduits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        prix: parseFloat(formData.prix),
        tva: parseFloat(formData.tva),
      };
      if (editingProduit) {
        await updateProduit(editingProduit.id, data);
      } else {
        await createProduit(data);
      }
      setShowModal(false);
      resetForm();
      loadProduits();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (produit) => {
    setEditingProduit(produit);
    setFormData({
      nom: produit.nom || '',
      description: produit.description || '',
      prix: produit.prix || '',
      tva: produit.tva || '20',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduit(id);
        loadProduits();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      prix: '',
      tva: '20',
    });
    setEditingProduit(null);
  };

  return (
    <Layout>
      <div className="produits-page">
        <div className="page-header">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Rechercher un produit..."
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
            <FiPlus /> Nouveau Produit
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="produits-grid">
            {produits.map((produit) => (
              <div key={produit.id} className="produit-card">
                <div className="produit-header">
                  <h3>{produit.nom}</h3>
                  <div className="produit-actions">
                    <button
                      className="icon-btn"
                      onClick={() => handleEdit(produit)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(produit.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="produit-info">
                  {produit.description && (
                    <p className="description">{produit.description}</p>
                  )}
                  <div className="produit-pricing">
                    <div className="price-item">
                      <span className="label">Prix unitaire:</span>
                      <span className="value">{produit.prix.toFixed(2)} DH</span>
                    </div>
                    <div className="price-item">
                      <span className="label">TVA:</span>
                      <span className="value">{produit.tva}%</span>
                    </div>
                    <div className="price-item total">
                      <span className="label">Prix TTC:</span>
                      <span className="value">
                        {(produit.prix * (1 + produit.tva / 100)).toFixed(2)} DH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduit ? 'Modifier' : 'Nouveau'} Produit</h2>
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
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prix unitaire (DH) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.prix}
                      onChange={(e) =>
                        setFormData({ ...formData, prix: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>TVA (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.tva}
                      onChange={(e) =>
                        setFormData({ ...formData, tva: e.target.value })
                      }
                    />
                  </div>
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
                    {editingProduit ? 'Modifier' : 'Créer'}
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

export default Produits;
