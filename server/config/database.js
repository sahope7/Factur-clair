const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// Initialiser la base de données
db.serialize(() => {
  // Table des utilisateurs
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nom TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table des clients
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT,
    telephone TEXT,
    adresse TEXT,
    ice TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table des produits
  db.run(`CREATE TABLE IF NOT EXISTS produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    prix REAL NOT NULL,
    tva REAL DEFAULT 20,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table des factures
  db.run(`CREATE TABLE IF NOT EXISTS factures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT UNIQUE NOT NULL,
    client_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    statut TEXT DEFAULT 'Brouillon',
    total_ht REAL DEFAULT 0,
    total_tva REAL DEFAULT 0,
    total_ttc REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )`);

  // Table des détails de facture
  db.run(`CREATE TABLE IF NOT EXISTS details_facture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facture_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    quantite INTEGER NOT NULL,
    prix_unitaire REAL NOT NULL,
    FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
  )`);

  // Créer l'utilisateur admin par défaut
  db.get('SELECT * FROM users WHERE email = ?', ['admin@factureclair.com'], (err, user) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur admin:', err);
    } else if (!user) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        'INSERT INTO users (email, password, nom) VALUES (?, ?, ?)',
        ['admin@factureclair.com', hashedPassword, 'Administrateur'],
        (err) => {
          if (err) {
            console.error('Erreur lors de la création de l\'utilisateur admin:', err);
          } else {
            console.log('Utilisateur admin créé avec succès');
          }
        }
      );
    }
  });
});

module.exports = db;
