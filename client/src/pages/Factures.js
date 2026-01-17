import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getFactures,
  deleteFacture,
  downloadFacturePDF,
} from '../services/api';
import { FiPlus, FiSearch, FiEye, FiTrash2, FiDownload, FiFilter, FiX } from 'react-icons/fi';
import './Factures.css';

const Factures = () => {
  const navigate = useNavigate();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    statut: '',
    date_debut: '',
    date_fin: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFactures();
  }, [search, filters]);

  const loadFactures = async () => {
    try {
      const params = { search };
      if (filters.statut) params.statut = filters.statut;
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const response = await getFactures(params);
      setFactures(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await deleteFacture(id);
        loadFactures();
      } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await downloadFacturePDF(id);
    } catch (error) {
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      Payée: 'badge-success',
      'Non payée': 'badge-danger',
      Brouillon: 'badge-warning',
    };
    return badges[statut] || 'badge-default';
  };

  const resetFilters = () => {
    setFilters({
      statut: '',
      date_debut: '',
      date_fin: '',
    });
  };

  return (
    <Layout>
      <div className="factures-page">
        <div className="page-header">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filtres
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate('/factures/nouvelle')}
            >
              <FiPlus /> Nouvelle Facture
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-content">
              <div className="filter-group">
                <label>Statut</label>
                <select
                  value={filters.statut}
                  onChange={(e) =>
                    setFilters({ ...filters, statut: e.target.value })
                  }
                >
                  <option value="">Tous</option>
                  <option value="Brouillon">Brouillon</option>
                  <option value="Payée">Payée</option>
                  <option value="Non payée">Non payée</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Date début</label>
                <input
                  type="date"
                  value={filters.date_debut}
                  onChange={(e) =>
                    setFilters({ ...filters, date_debut: e.target.value })
                  }
                />
              </div>
              <div className="filter-group">
                <label>Date fin</label>
                <input
                  type="date"
                  value={filters.date_fin}
                  onChange={(e) =>
                    setFilters({ ...filters, date_fin: e.target.value })
                  }
                />
              </div>
              <button className="btn-link" onClick={resetFilters}>
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="factures-table-container">
            <table className="factures-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total HT</th>
                  <th>Total TVA</th>
                  <th>Total TTC</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {factures.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  factures.map((facture) => (
                    <tr key={facture.id}>
                      <td className="numero">{facture.numero}</td>
                      <td>{facture.client_nom || 'N/A'}</td>
                      <td>
                        {new Date(facture.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td>{facture.total_ht.toFixed(2)} €</td>
                      <td>{facture.total_tva.toFixed(2)} €</td>
                      <td className="total-ttc">
                        {facture.total_ttc.toFixed(2)} €
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatutBadge(facture.statut)}`}
                        >
                          {facture.statut}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-btn"
                            onClick={() =>
                              navigate(`/factures/${facture.id}`)
                            }
                            title="Voir les détails"
                          >
                            <FiEye />
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => handleDownloadPDF(facture.id)}
                            title="Télécharger PDF"
                          >
                            <FiDownload />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(facture.id)}
                            title="Supprimer"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Factures;
