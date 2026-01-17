import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Produits from './pages/Produits';
import Factures from './pages/Factures';
import FactureDetail from './pages/FactureDetail';
import NouvelleFacture from './pages/NouvelleFacture';
import { isAuthenticated } from './utils/auth';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <Clients />
            </PrivateRoute>
          }
        />
        <Route
          path="/produits"
          element={
            <PrivateRoute>
              <Produits />
            </PrivateRoute>
          }
        />
        <Route
          path="/factures"
          element={
            <PrivateRoute>
              <Factures />
            </PrivateRoute>
          }
        />
        <Route
          path="/factures/nouvelle"
          element={
            <PrivateRoute>
              <NouvelleFacture />
            </PrivateRoute>
          }
        />
        <Route
          path="/factures/:id"
          element={
            <PrivateRoute>
              <FactureDetail />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
