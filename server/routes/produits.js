const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Obtenir tous les produits
router.get('/', (req, res) => {
  const { search } = req.query;
  
  let query = 'SELECT * FROM produits';
  const params = [];

  if (search) {
    query += ' WHERE nom LIKE ? OR description LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, produits) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
    res.json(produits);
  });
});

// Obtenir un produit par ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM produits WHERE id = ?', [id], (err, produit) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
    }
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(produit);
  });
});

// Créer un produit
router.post('/', (req, res) => {
  const { nom, description, prix, tva } = req.body;

  if (!nom || prix === undefined) {
    return res.status(400).json({ error: 'Le nom et le prix sont requis' });
  }

  const tvaValue = tva !== undefined ? tva : 20;

  db.run(
    'INSERT INTO produits (nom, description, prix, tva) VALUES (?, ?, ?, ?)',
    [nom, description || null, prix, tvaValue],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la création du produit' });
      }
      res.status(201).json({ id: this.lastID, nom, description, prix, tva: tvaValue });
    }
  );
});

// Mettre à jour un produit
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nom, description, prix, tva } = req.body;

  if (!nom || prix === undefined) {
    return res.status(400).json({ error: 'Le nom et le prix sont requis' });
  }

  const tvaValue = tva !== undefined ? tva : 20;

  db.run(
    'UPDATE produits SET nom = ?, description = ?, prix = ?, tva = ? WHERE id = ?',
    [nom, description || null, prix, tvaValue, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      res.json({ id, nom, description, prix, tva: tvaValue });
    }
  );
});

// Supprimer un produit
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Vérifier si le produit est utilisé dans des factures
  db.get('SELECT COUNT(*) as count FROM details_facture WHERE produit_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la vérification' });
    }

    if (result.count > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer un produit utilisé dans des factures' });
    }

    db.run('DELETE FROM produits WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      res.json({ message: 'Produit supprimé avec succès' });
    });
  });
});

module.exports = router;
