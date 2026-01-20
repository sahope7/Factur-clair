const db = require('./config/database');
const bcrypt = require('bcryptjs');

// Helper to run SQL with promises
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

const cleanData = async () => {
    console.log('🧹 Nettoyage de la base de données...');
    await run('DELETE FROM details_facture');
    await run('DELETE FROM factures');
    await run('DELETE FROM produits');
    await run('DELETE FROM clients');
    // On garde les users pour ne pas supprimer le compte admin
};

const seedClients = async () => {
    console.log('👥 Création des clients...');
    const clients = [
        {
            nom: 'TechStart Solutions',
            email: 'contact@techstart.ma',
            telephone: '05 22 12 34 56',
            adresse: '123 Bd Zerktouni, Casablanca',
            ice: '123456789000123'
        },
        {
            nom: 'Green Garden Design',
            email: 'info@greengarden.ma',
            telephone: '06 61 98 76 54',
            adresse: '45 Ave de France, Rabat',
            ice: '987654321000987'
        },
        {
            nom: 'Atlas Consulting Group',
            email: 'support@atlasconsulting.ma',
            telephone: '05 24 45 67 89',
            adresse: 'Immeuble Saada, Guéliz, Marrakech',
            ice: '456789123000456'
        },
        {
            nom: 'Digital Waves Agency',
            email: 'hello@digitalwaves.ma',
            telephone: '05 39 33 22 11',
            adresse: 'Technopark, Tanger',
            ice: '789123456000789'
        }
    ];

    const clientIds = [];
    for (const client of clients) {
        const result = await run(
            'INSERT INTO clients (nom, email, telephone, adresse, ice) VALUES (?, ?, ?, ?, ?)',
            [client.nom, client.email, client.telephone, client.adresse, client.ice]
        );
        clientIds.push(result.lastID);
    }
    return clientIds;
};

const seedProduits = async () => {
    console.log('📦 Création des produits...');
    const produits = [
        {
            nom: 'Développement Site Web Vitrine',
            description: 'Site web responsive 5 pages, formulaire de contact, SEO de base.',
            prix: 5000.00,
            tva: 20
        },
        {
            nom: 'Maintenance Mensuelle',
            description: 'Mises à jour de sécurité, sauvegardes hebdo, support technique.',
            prix: 500.00,
            tva: 20
        },
        {
            nom: 'Pack Identité Visuelle',
            description: 'Logo, charte graphique, cartes de visite.',
            prix: 3500.00,
            tva: 20
        },
        {
            nom: 'Audit SEO Complet',
            description: 'Analyse technique, analyse de contenu, rapport de recommandations.',
            prix: 2000.00,
            tva: 20
        },
        {
            nom: 'Développement Application Mobile',
            description: 'App iOS et Android native avec React Native.',
            prix: 15000.00,
            tva: 20
        },
        {
            nom: 'Formation Équipe (Journée)',
            description: 'Formation sur les outils digitaux et bonnes pratiques.',
            prix: 1200.00,
            tva: 20
        }
    ];

    const produitIds = [];
    for (const produit of produits) {
        const result = await run(
            'INSERT INTO produits (nom, description, prix, tva) VALUES (?, ?, ?, ?)',
            [produit.nom, produit.description, produit.prix, produit.tva]
        );
        produitIds.push({ ...produit, id: result.lastID });
    }
    return produitIds;
};

const seedFactures = async (clientIds, produits) => {
    console.log('📄 Création des factures...');

    // Générer des dates sur les 6 derniers mois
    const today = new Date();

    const factures = [
        // Factures payées (pour gonfler le CA et les graphs)
        { clientIdx: 0, items: [0, 1], statut: 'Payée', monthsAgo: 0 },
        { clientIdx: 1, items: [2, 3], statut: 'Payée', monthsAgo: 1 },
        { clientIdx: 2, items: [4], statut: 'Payée', monthsAgo: 2 },
        { clientIdx: 0, items: [1], statut: 'Payée', monthsAgo: 1 },
        { clientIdx: 3, items: [0, 2], statut: 'Payée', monthsAgo: 3 },
        { clientIdx: 1, items: [1, 5], statut: 'Payée', monthsAgo: 4 },
        { clientIdx: 2, items: [3], statut: 'Payée', monthsAgo: 5 },

        // Factures en attente (pour le tableau de bord)
        { clientIdx: 3, items: [4, 1], statut: 'Non payée', monthsAgo: 0 },
        { clientIdx: 0, items: [5], statut: 'Non payée', monthsAgo: 0 },

        // Brouillons
        { clientIdx: 1, items: [0], statut: 'Brouillon', monthsAgo: 0 }
    ];

    let facCounter = 1;

    for (const fac of factures) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - fac.monthsAgo);
        // Un peu de hasard dans les jours
        date.setDate(Math.floor(Math.random() * 25) + 1);
        const dateStr = date.toISOString().split('T')[0];

        const numero = `FAC-${String(facCounter).padStart(3, '0')}`;
        facCounter++;

        // Calcul totaux
        let total_ht = 0;
        let total_tva = 0;
        const factureItems = [];

        for (const itemIdx of fac.items) {
            const prod = produits[itemIdx];
            const quantite = Math.floor(Math.random() * 2) + 1; // 1 ou 2
            const montantHT = prod.prix * quantite;
            const montantTVA = montantHT * (prod.tva / 100);

            total_ht += montantHT;
            total_tva += montantTVA;

            factureItems.push({
                produit_id: prod.id,
                quantite,
                prix_unitaire: prod.prix
            });
        }

        const total_ttc = total_ht + total_tva;

        // Insert Facture
        const resFacture = await run(
            'INSERT INTO factures (numero, client_id, date, statut, total_ht, total_tva, total_ttc) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [numero, clientIds[fac.clientIdx], dateStr, fac.statut, total_ht, total_tva, total_ttc]
        );

        // Insert Details
        for (const item of factureItems) {
            await run(
                'INSERT INTO details_facture (facture_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
                [resFacture.lastID, item.produit_id, item.quantite, item.prix_unitaire]
            );
        }
    }
};

const main = async () => {
    try {
        await cleanData();
        const clientIds = await seedClients();
        const produits = await seedProduits();
        await seedFactures(clientIds, produits);
        console.log('✅ Base de données peuplée avec succès !');
    } catch (err) {
        console.error('❌ Erreur:', err);
    } finally {
        // Le script ne se ferme pas tout seul à cause de la co db sqlite ouverte, 
        // mais pour un script one-shot c'est pas grave, on peut tuer le process ou utiliser db.close()
        // Cependant db.close() est asynchrone et peut poser souci si mal géré, le plus simple est process.exit
        process.exit(0);
    }
};

main();
