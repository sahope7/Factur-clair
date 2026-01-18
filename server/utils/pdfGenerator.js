const PDFDocument = require('pdfkit');
const db = require('../config/database');

function generateInvoicePDF(factureId, res) {
   // Récupérer la facture avec tous les détails
   db.get(
      `SELECT f.*, c.nom as client_nom, c.email as client_email, c.telephone as client_telephone,
     c.adresse as client_adresse, c.ice as client_ice
     FROM factures f
     LEFT JOIN clients c ON f.client_id = c.id
     WHERE f.id = ?`,
      [factureId],
      (err, facture) => {
         if (err || !facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
         }

         // Récupérer les détails
         db.all(
            `SELECT df.*, p.nom as produit_nom, p.description as produit_description, p.tva
         FROM details_facture df
         LEFT JOIN produits p ON df.produit_id = p.id
         WHERE df.facture_id = ?`,
            [factureId],
            (err, details) => {
               if (err) {
                  return res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
               }

               // Créer le document PDF
               const doc = new PDFDocument({ margin: 50 });

               // Nom du fichier
               res.setHeader('Content-Disposition', `attachment; filename="Facture-${facture.numero}.pdf"`);
               res.setHeader('Content-Type', 'application/pdf');

               doc.pipe(res);

               // En-tête avec logo (texte pour l'instant)
               doc.fontSize(24)
                  .fillColor('#2c3e50')
                  .text('FacturÉclair', 50, 50, { align: 'left' });

               doc.fontSize(10)
                  .fillColor('#7f8c8d')
                  .text('Application de Facturation Professionnelle', 50, 80);

               // Informations de l'entreprise
               doc.fontSize(12)
                  .fillColor('#34495e')
                  .text('Votre Entreprise', 50, 120)
                  .fontSize(10)
                  .fillColor('#7f8c8d')
                  .text('123 Rue de l\'Exemple', 50, 140)
                  .text('75000 Paris, France', 50, 155)
                  .text('Email: contact@votrentreprise.com', 50, 170)
                  .text('Téléphone: +33 1 23 45 67 89', 50, 185);

               // Informations du client (à droite)
               doc.fontSize(12)
                  .fillColor('#34495e')
                  .text('Facturé à:', 400, 120)
                  .fontSize(10)
                  .fillColor('#2c3e50')
                  .text(facture.client_nom, 400, 140);

               if (facture.client_adresse) {
                  doc.fillColor('#7f8c8d')
                     .text(facture.client_adresse, 400, 155);
               }
               if (facture.client_email) {
                  doc.text(facture.client_email, 400, 170);
               }
               if (facture.client_telephone) {
                  doc.text(facture.client_telephone, 400, 185);
               }
               if (facture.client_ice) {
                  doc.text(`ICE: ${facture.client_ice}`, 400, 200);
               }

               // Informations de la facture
               doc.moveTo(50, 250)
                  .lineTo(550, 250)
                  .strokeColor('#bdc3c7')
                  .stroke();

               doc.fontSize(16)
                  .fillColor('#2c3e50')
                  .text('FACTURE', 50, 270);

               doc.fontSize(10)
                  .fillColor('#7f8c8d')
                  .text(`Numéro: ${facture.numero}`, 400, 270)
                  .text(`Date: ${new Date(facture.date).toLocaleDateString('fr-FR')}`, 400, 285)
                  .text(`Statut: ${facture.statut}`, 400, 300);

               // Tableau des produits
               let yPosition = 350;

               // En-tête du tableau
               doc.fontSize(10)
                  .fillColor('#34495e')
                  .text('Description', 50, yPosition)
                  .text('Qté', 300, yPosition)
                  .text('Prix unitaire', 350, yPosition)
                  .text('TVA', 420, yPosition)
                  .text('Total HT', 470, yPosition);

               doc.moveTo(50, yPosition + 15)
                  .lineTo(550, yPosition + 15)
                  .strokeColor('#34495e')
                  .lineWidth(1)
                  .stroke();

               yPosition += 30;

               // Détails des produits
               details.forEach((detail) => {
                  const montantHT = detail.prix_unitaire * detail.quantite;
                  const montantTVA = montantHT * (detail.tva / 100);

                  doc.fillColor('#2c3e50')
                     .text(detail.produit_nom, 50, yPosition)
                     .text(detail.quantite.toString(), 300, yPosition)
                     .text(`${detail.prix_unitaire.toFixed(2)} DH`, 350, yPosition)
                     .text(`${detail.tva}%`, 420, yPosition)
                     .text(`${montantHT.toFixed(2)} DH`, 470, yPosition);

                  if (detail.produit_description) {
                     doc.fontSize(8)
                        .fillColor('#7f8c8d')
                        .text(detail.produit_description, 50, yPosition + 12, { width: 250 });
                     doc.fontSize(10);
                  }

                  yPosition += 35;
               });

               // Totaux
               yPosition += 20;
               doc.moveTo(50, yPosition)
                  .lineTo(550, yPosition)
                  .strokeColor('#bdc3c7')
                  .stroke();

               yPosition += 20;

               doc.fontSize(10)
                  .fillColor('#2c3e50')
                  .text('Total HT:', 400, yPosition)
                  .text(`${facture.total_ht.toFixed(2)} DH`, 470, yPosition, { align: 'right' });

               yPosition += 20;
               doc.text('Total TVA:', 400, yPosition)
                  .text(`${facture.total_tva.toFixed(2)} DH`, 470, yPosition, { align: 'right' });

               yPosition += 20;
               doc.fontSize(12)
                  .fillColor('#27ae60')
                  .text('Total TTC:', 400, yPosition)
                  .text(`${facture.total_ttc.toFixed(2)} DH`, 470, yPosition, { align: 'right' });

               // Pied de page
               doc.fontSize(8)
                  .fillColor('#95a5a6')
                  .text('Merci pour votre confiance !', 50, 750, { align: 'center' });

               doc.end();
            }
         );
      }
   );
}

module.exports = { generateInvoicePDF };
