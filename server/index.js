const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/produits', require('./routes/produits'));
app.use('/api/factures', require('./routes/factures'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/pdf', require('./routes/pdf'));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API FacturÉclair fonctionnelle' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Base de données initialisée`);
});

module.exports = app;
