const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Obtenir toutes les factures avec filtres
router.get('/', (req, res) => {
  const { client_id, statut, date_debut, date_fin, search } = req.query;
  
  let query = `
    SELECT f.*, c.nom as client_nom, c.email as client_email
    FROM factures f
    LEFT JOIN clients c ON f.client_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (client_id) {
    query += ' AND f.client_id = ?';
    params.push(client_id);
  }

  if (statut) {
    query += ' AND f.statut = ?';
    params.push(statut);
  }

  if (date_debut) {
    query += ' AND f.date >= ?';
    params.push(date_debut);
  }

  if (date_fin) {
    query += ' AND f.date <= ?';
    params.push(date_fin);
  }

  if (search) {
    query += ' AND (f.numero LIKE ? OR c.nom LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY f.created_at DESC';

  db.all(query, params, (err, factures) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
    }
    res.json(factures);
  });
});

// Obtenir une facture par ID avec détails
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // Récupérer la facture avec les informations du client
  db.get(
    `SELECT f.*, c.nom as client_nom, c.email as client_email, c.telephone as client_telephone,
     c.adresse as client_adresse, c.ice as client_ice
     FROM factures f
     LEFT JOIN clients c ON f.client_id = c.id
     WHERE f.id = ?`,
    [id],
    (err, facture) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération de la facture' });
      }
      if (!facture) {
        return res.status(404).json({ error: 'Facture non trouvée' });
      }

      // Récupérer les détails de la facture
      db.all(
        `SELECT df.*, p.nom as produit_nom, p.description as produit_description, p.tva
         FROM details_facture df
         LEFT JOIN produits p ON df.produit_id = p.id
         WHERE df.facture_id = ?`,
        [id],
        (err, details) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des détails' });
          }
          res.json({ ...facture, details });
        }
      );
    }
  );
});

// Générer le prochain numéro de facture
function generateNumeroFacture(callback) {
  db.get('SELECT numero FROM factures ORDER BY id DESC LIMIT 1', (err, lastFacture) => {
    if (err) {
      return callback(err);
    }

    let nextNum = 1;
    if (lastFacture) {
      const match = lastFacture.numero.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }

    const numero = `FAC-${String(nextNum).padStart(3, '0')}`;
    callback(null, numero);
  });
}

// Créer une facture
router.post('/', (req, res) => {
  const { client_id, date, statut, produits } = req.body;

  if (!client_id || !date) {
    return res.status(400).json({ error: 'Le client et la date sont requis' });
  }

  if (!produits || produits.length === 0) {
    return res.status(400).json({ error: 'Au moins un produit est requis' });
  }

  generateNumeroFacture((err, numero) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la génération du numéro' });
    }

    // Calculer les totaux
    let total_ht = 0;
    let total_tva = 0;

    produits.forEach(item => {
      const montantHT = item.prix_unitaire * item.quantite;
      const montantTVA = montantHT * (item.tva / 100);
      total_ht += montantHT;
      total_tva += montantTVA;
    });

    const total_ttc = total_ht + total_tva;
    const statutValue = statut || 'Brouillon';

    // Insérer la facture
    db.run(
      'INSERT INTO factures (numero, client_id, date, statut, total_ht, total_tva, total_ttc) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [numero, client_id, date, statutValue, total_ht, total_tva, total_ttc],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la création de la facture' });
        }

        const factureId = this.lastID;

        // Insérer les détails
        const stmt = db.prepare('INSERT INTO details_facture (facture_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)');
        
        produits.forEach(item => {
          stmt.run([factureId, item.produit_id, item.quantite, item.prix_unitaire]);
        });

        stmt.finalize((err) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la création des détails' });
          }

          res.status(201).json({
            id: factureId,
            numero,
            client_id,
            date,
            statut: statutValue,
            total_ht,
            total_tva,
            total_ttc
          });
        });
      }
    );
  });
});

// Mettre à jour une facture
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { client_id, date, statut, produits } = req.body;

  if (!client_id || !date) {
    return res.status(400).json({ error: 'Le client et la date sont requis' });
  }

  if (!produits || produits.length === 0) {
    return res.status(400).json({ error: 'Au moins un produit est requis' });
  }

  // Calculer les totaux
  let total_ht = 0;
  let total_tva = 0;

  produits.forEach(item => {
    const montantHT = item.prix_unitaire * item.quantite;
    const montantTVA = montantHT * (item.tva / 100);
    total_ht += montantHT;
    total_tva += montantTVA;
  });

  const total_ttc = total_ht + total_tva;

  // Mettre à jour la facture
  db.run(
    'UPDATE factures SET client_id = ?, date = ?, statut = ?, total_ht = ?, total_tva = ?, total_ttc = ? WHERE id = ?',
    [client_id, date, statut, total_ht, total_tva, total_ttc, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Facture non trouvée' });
      }

      // Supprimer les anciens détails
      db.run('DELETE FROM details_facture WHERE facture_id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la mise à jour des détails' });
        }

        // Insérer les nouveaux détails
        const stmt = db.prepare('INSERT INTO details_facture (facture_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)');
        
        produits.forEach(item => {
          stmt.run([id, item.produit_id, item.quantite, item.prix_unitaire]);
        });

        stmt.finalize((err) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour des détails' });
          }

          res.json({
            id,
            client_id,
            date,
            statut,
            total_ht,
            total_tva,
            total_ttc
          });
        });
      });
    }
  );
});

// Supprimer une facture
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM factures WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression de la facture' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    res.json({ message: 'Facture supprimée avec succès' });
  });
});

module.exports = router;
