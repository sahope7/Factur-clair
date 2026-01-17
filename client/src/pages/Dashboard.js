import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getDashboardStats } from '../services/api';
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiPackage,
  FiDollarSign,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading">Chargement...</div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Total Factures',
      value: stats?.totalFactures || 0,
      icon: FiFileText,
      color: '#3498db',
    },
    {
      title: 'Factures Payées',
      value: stats?.facturesPayees || 0,
      icon: FiCheckCircle,
      color: '#27ae60',
    },
    {
      title: 'Factures Non Payées',
      value: stats?.facturesNonPayees || 0,
      icon: FiXCircle,
      color: '#e74c3c',
    },
    {
      title: 'Chiffre d\'Affaires',
      value: `${(stats?.chiffreAffaires || 0).toFixed(2)} €`,
      icon: FiDollarSign,
      color: '#f39c12',
    },
    {
      title: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: FiUsers,
      color: '#9b59b6',
    },
    {
      title: 'Total Produits',
      value: stats?.totalProduits || 0,
      icon: FiPackage,
      color: '#1abc9c',
    },
  ];

  const formatMonth = (mois) => {
    const [year, month] = mois.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  const chartData = (stats?.revenusParMois || []).map((item) => ({
    mois: formatMonth(item.mois),
    revenus: parseFloat(item.revenus.toFixed(2)),
  }));

  return (
    <Layout>
      <div className="dashboard">
        <div className="stats-grid">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                  <Icon />
                </div>
                <div className="stat-content">
                  <h3>{card.title}</h3>
                  <p className="stat-value">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chart-container">
          <h2>Revenus par mois (12 derniers mois)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} €`} />
              <Line
                type="monotone"
                dataKey="revenus"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: '#667eea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
