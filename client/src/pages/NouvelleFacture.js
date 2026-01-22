import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { createFacture, getClients, getProduits } from '../services/api';
import { FiArrowLeft, FiPlus, FiX, FiSave } from 'react-icons/fi';
import './NouvelleFacture.css';

const NouvelleFacture = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    statut: 'Brouillon',
    produits: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsRes, produitsRes] = await Promise.all([
        getClients(),
        getProduits(),
      ]);
      setClients(clientsRes.data);
      setProduits(produitsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (formData.produits.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    try {
      const response = await createFacture(formData);
      navigate(`/factures/${response.data.id}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleAddProduit = () => {
    if (produits.length > 0) {
      const produit = produits[0];
      setFormData({
        ...formData,
        produits: [
          ...formData.produits,
          {
            produit_id: produit.id,
            quantite: 1,
            prix_unitaire: produit.prix,
            tva: produit.tva,
          },
        ],
      });
    }
  };

  const handleRemoveProduit = (index) => {
    setFormData({
      ...formData,
      produits: formData.produits.filter((_, i) => i !== index),
    });
  };

  const handleProduitChange = (index, field, value) => {
    const newProduits = [...formData.produits];
    if (field === 'produit_id') {
      const produit = produits.find((p) => p.id === parseInt(value));
      if (produit) {
        newProduits[index] = {
          ...newProduits[index],
          produit_id: produit.id,
          prix_unitaire: produit.prix,
          tva: produit.tva,
        };
      }
    } else {
      newProduits[index][field] =
        field === 'quantite' ? parseInt(value) : parseFloat(value);
    }
    setFormData({ ...formData, produits: newProduits });
  };

  const calculateTotals = () => {
    let totalHT = 0;
    let totalTVA = 0;

    formData.produits.forEach((item) => {
      const montantHT = item.prix_unitaire * item.quantite;
      const montantTVA = montantHT * (item.tva / 100);
      totalHT += montantHT;
      totalTVA += montantTVA;
    });

    return {
      totalHT,
      totalTVA,
      totalTTC: totalHT + totalTVA,
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Chargement...</div>
      </Layout>
    );
  }

  const totals = calculateTotals();

  return (
    <Layout>
      <div className="nouvelle-facture">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/factures')}>
            <FiArrowLeft /> Retour
          </button>
          <h1>Nouvelle Facture</h1>
        </div>

        <form onSubmit={handleSubmit} className="facture-form">
          <div className="form-section">
            <h3>Informations générales</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Client *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) =>
                    setFormData({ ...formData, client_id: e.target.value })
                  }
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) =>
                    setFormData({ ...formData, statut: e.target.value })
                  }
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Payée">Payée</option>
                  <option value="Non payée">Non payée</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Produits / Services</h3>
              <button
                type="button"
                className="btn-add"
                onClick={handleAddProduit}
              >
                <FiPlus /> Ajouter
              </button>
            </div>

            {formData.produits.length === 0 ? (
              <div className="empty-produits">
                <p>Aucun produit ajouté. Cliquez sur "Ajouter" pour commencer.</p>
              </div>
            ) : (
              <>
                <div className="produits-list">
                  {formData.produits.map((item, index) => {
                    const produit = produits.find((p) => p.id === item.produit_id);
                    return (
                      <div key={index} className="produit-row">
                        <select
                          value={item.produit_id}
                          onChange={(e) =>
                            handleProduitChange(index, 'produit_id', e.target.value)
                          }
                          required
                        >
                          <option value="">Sélectionner un produit</option>
                          {produits.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nom}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantite}
                          onChange={(e) =>
                            handleProduitChange(index, 'quantite', e.target.value)
                          }
                          placeholder="Qté"
                          required
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={item.prix_unitaire}
                          onChange={(e) =>
                            handleProduitChange(
                              index,
                              'prix_unitaire',
                              e.target.value
                            )
                          }
                          placeholder="Prix"
                          required
                        />
                        <span className="tva-badge">{item.tva}%</span>
                        <span className="montant">
                          {(
                            item.prix_unitaire *
                            item.quantite *
                            (1 + item.tva / 100)
                          ).toFixed(2)}{' '}
                          DH
                        </span>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveProduit(index)}
                        >
                          <FiX />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="totals-section">
                  <div className="total-row">
                    <span>Total HT:</span>
                    <span>{totals.totalHT.toFixed(2)} DH</span>
                  </div>
                  <div className="total-row">
                    <span>Total TVA:</span>
                    <span>{totals.totalTVA.toFixed(2)} DH</span>
                  </div>
                  <div className="total-row final">
                    <span>Total TTC:</span>
                    <span>{totals.totalTTC.toFixed(2)} DH</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/factures')}
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              <FiSave /> Créer la facture
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NouvelleFacture;
