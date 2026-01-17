const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Obtenir les statistiques du dashboard
router.get('/', (req, res) => {
  const stats = {};

  // Nombre total de factures
  db.get('SELECT COUNT(*) as total FROM factures', (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
    stats.totalFactures = result.total;

    // Nombre de factures payées
    db.get('SELECT COUNT(*) as total FROM factures WHERE statut = ?', ['Payée'], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
      }
      stats.facturesPayees = result.total;

      // Nombre de factures non payées
      db.get('SELECT COUNT(*) as total FROM factures WHERE statut = ?', ['Non payée'], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
        }
        stats.facturesNonPayees = result.total;

        // Chiffre d'affaires global
        db.get('SELECT SUM(total_ttc) as total FROM factures WHERE statut = ?', ['Payée'], (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
          }
          stats.chiffreAffaires = result.total || 0;

          // Revenus par mois (12 derniers mois)
          const query = `
            SELECT 
              strftime('%Y-%m', date) as mois,
              SUM(total_ttc) as revenus
            FROM factures
            WHERE statut = 'Payée'
              AND date >= date('now', '-12 months')
            GROUP BY strftime('%Y-%m', date)
            ORDER BY mois ASC
          `;

          db.all(query, [], (err, revenus) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur lors de la récupération des revenus' });
            }
            stats.revenusParMois = revenus;

            // Nombre total de clients
            db.get('SELECT COUNT(*) as total FROM clients', (err, result) => {
              if (err) {
                return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
              }
              stats.totalClients = result.total;

              // Nombre total de produits
              db.get('SELECT COUNT(*) as total FROM produits', (err, result) => {
                if (err) {
                  return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
                }
                stats.totalProduits = result.total;

                res.json(stats);
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
