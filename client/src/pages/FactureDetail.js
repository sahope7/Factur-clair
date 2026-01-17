import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getFacture,
  updateFacture,
  deleteFacture,
  downloadFacturePDF,
  getClients,
  getProduits,
} from '../services/api';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiSave,
  FiX,
  FiPlus,
} from 'react-icons/fi';
import './FactureDetail.css';

const FactureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    date: '',
    statut: 'Brouillon',
    produits: [],
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [factureRes, clientsRes, produitsRes] = await Promise.all([
        getFacture(id),
        getClients(),
        getProduits(),
      ]);

      const factureData = factureRes.data;
      setFacture(factureData);
      setClients(clientsRes.data);
      setProduits(produitsRes.data);

      setFormData({
        client_id: factureData.client_id,
        date: factureData.date,
        statut: factureData.statut,
        produits: factureData.details.map((detail) => ({
          produit_id: detail.produit_id,
          quantite: detail.quantite,
          prix_unitaire: detail.prix_unitaire,
          tva: detail.tva,
        })),
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateFacture(id, formData);
      setEditing(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await deleteFacture(id);
        navigate('/factures');
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
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

  if (!facture) {
    return (
      <Layout>
        <div className="error">Facture non trouvée</div>
      </Layout>
    );
  }

  const totals = calculateTotals();
  const currentFacture = editing ? { ...facture, ...totals } : facture;

  return (
    <Layout>
      <div className="facture-detail">
        <div className="detail-header">
          <button className="btn-back" onClick={() => navigate('/factures')}>
            <FiArrowLeft /> Retour
          </button>
          <div className="header-actions">
            {!editing && (
              <>
                <button
                  className="btn-secondary"
                  onClick={() => setEditing(true)}
                >
                  <FiEdit2 /> Modifier
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => downloadFacturePDF(id)}
                >
                  <FiDownload /> Télécharger PDF
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  <FiTrash2 /> Supprimer
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
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
                        €
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
                  <span>{totals.totalHT.toFixed(2)} €</span>
                </div>
                <div className="total-row">
                  <span>Total TVA:</span>
                  <span>{totals.totalTVA.toFixed(2)} €</span>
                </div>
                <div className="total-row final">
                  <span>Total TTC:</span>
                  <span>{totals.totalTTC.toFixed(2)} €</span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    loadData();
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave /> Enregistrer
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="facture-view">
            <div className="facture-info">
              <div className="info-section">
                <h3>Informations de la facture</h3>
                <div className="info-grid">
                  <div>
                    <label>Numéro:</label>
                    <p>{facture.numero}</p>
                  </div>
                  <div>
                    <label>Date:</label>
                    <p>
                      {new Date(facture.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label>Statut:</label>
                    <span
                      className={`badge ${
                        facture.statut === 'Payée'
                          ? 'badge-success'
                          : facture.statut === 'Non payée'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {facture.statut}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Client</h3>
                <div className="client-info">
                  <p>
                    <strong>{facture.client_nom}</strong>
                  </p>
                  {facture.client_email && <p>{facture.client_email}</p>}
                  {facture.client_telephone && (
                    <p>{facture.client_telephone}</p>
                  )}
                  {facture.client_adresse && <p>{facture.client_adresse}</p>}
                </div>
              </div>
            </div>

            <div className="produits-section">
              <h3>Détails de la facture</h3>
              <table className="produits-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>TVA</th>
                    <th>Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {facture.details.map((detail, index) => {
                    const montantHT = detail.prix_unitaire * detail.quantite;
                    const montantTVA = montantHT * (detail.tva / 100);
                    const montantTTC = montantHT + montantTVA;
                    return (
                      <tr key={index}>
                        <td>
                          <strong>{detail.produit_nom}</strong>
                          {detail.produit_description && (
                            <p className="description">
                              {detail.produit_description}
                            </p>
                          )}
                        </td>
                        <td>{detail.quantite}</td>
                        <td>{detail.prix_unitaire.toFixed(2)} €</td>
                        <td>{detail.tva}%</td>
                        <td>{montantTTC.toFixed(2)} €</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4">
                      <strong>Total HT</strong>
                    </td>
                    <td>
                      <strong>{facture.total_ht.toFixed(2)} €</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4">
                      <strong>Total TVA</strong>
                    </td>
                    <td>
                      <strong>{facture.total_tva.toFixed(2)} €</strong>
                    </td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan="4">
                      <strong>Total TTC</strong>
                    </td>
                    <td>
                      <strong className="total-ttc">
                        {facture.total_ttc.toFixed(2)} €
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FactureDetail;
