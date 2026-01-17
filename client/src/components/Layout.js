import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Tableau de bord' },
    { path: '/clients', icon: FiUsers, label: 'Clients' },
    { path: '/produits', icon: FiPackage, label: 'Produits' },
    { path: '/factures', icon: FiFileText, label: 'Factures' },
  ];

  return (
    <div className="layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>FacturÉclair</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <h1 className="page-title">
            {menuItems.find((item) => item.path === location.pathname)?.label ||
              'FacturÉclair'}
          </h1>
        </header>
        <div className="content">{children}</div>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
