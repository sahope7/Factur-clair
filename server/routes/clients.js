const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tous les endpoints nécessitent une authentification
router.use(authenticateToken);

// Obtenir tous les clients
router.get('/', (req, res) => {
  const { search } = req.query;
  
  let query = 'SELECT * FROM clients';
  const params = [];

  if (search) {
    query += ' WHERE nom LIKE ? OR email LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, clients) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
    }
    res.json(clients);
  });
});

// Obtenir un client par ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM clients WHERE id = ?', [id], (err, client) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du client' });
    }
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    res.json(client);
  });
});

// Créer un client
router.post('/', (req, res) => {
  const { nom, email, telephone, adresse, ice } = req.body;

  if (!nom) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  db.run(
    'INSERT INTO clients (nom, email, telephone, adresse, ice) VALUES (?, ?, ?, ?, ?)',
    [nom, email || null, telephone || null, adresse || null, ice || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Un client avec cet email existe déjà' });
        }
        return res.status(500).json({ error: 'Erreur lors de la création du client' });
      }
      res.status(201).json({ id: this.lastID, nom, email, telephone, adresse, ice });
    }
  );
});

// Mettre à jour un client
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nom, email, telephone, adresse, ice } = req.body;

  if (!nom) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  db.run(
    'UPDATE clients SET nom = ?, email = ?, telephone = ?, adresse = ?, ice = ? WHERE id = ?',
    [nom, email || null, telephone || null, adresse || null, ice || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du client' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }
      res.json({ id, nom, email, telephone, adresse, ice });
    }
  );
});

// Supprimer un client
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Vérifier si le client a des factures
  db.get('SELECT COUNT(*) as count FROM factures WHERE client_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la vérification' });
    }

    if (result.count > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer un client avec des factures associées' });
    }

    db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression du client' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }
      res.json({ message: 'Client supprimé avec succès' });
    });
  });
});

module.exports = router;
