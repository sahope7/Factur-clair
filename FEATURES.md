# Fonctionnalités - FacturÉclair

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification
- ✅ Page de connexion sécurisée
- ✅ Authentification par JWT
- ✅ Hashage des mots de passe avec bcrypt
- ✅ Protection des routes privées
- ✅ Gestion de session

### 👤 Gestion des Clients
- ✅ Liste des clients avec recherche
- ✅ Ajout d'un nouveau client
- ✅ Modification d'un client existant
- ✅ Suppression d'un client (avec vérification des factures associées)
- ✅ Champs : nom, email, téléphone, adresse, ICE

### 📦 Gestion des Produits/Services
- ✅ Liste des produits avec recherche
- ✅ Ajout d'un nouveau produit
- ✅ Modification d'un produit existant
- ✅ Suppression d'un produit (avec vérification des factures associées)
- ✅ Champs : nom, description, prix unitaire, taux de TVA
- ✅ Affichage du prix TTC calculé automatiquement

### 🧾 Gestion des Factures (Module Principal)
- ✅ Création de factures avec numéro automatique (FAC-001, FAC-002, etc.)
- ✅ Sélection d'un client
- ✅ Ajout de plusieurs produits/services par facture
- ✅ Quantité personnalisable par produit
- ✅ Calcul automatique :
  - Total HT
  - Total TVA
  - Total TTC
- ✅ Statuts : Brouillon, Payée, Non payée
- ✅ Historique des factures
- ✅ Consultation des détails d'une facture
- ✅ Modification d'une facture
- ✅ Suppression d'une facture
- ✅ Filtres par client, statut, date
- ✅ Recherche rapide

### 📄 Génération PDF
- ✅ Bouton "Télécharger la facture"
- ✅ PDF professionnel contenant :
  - Logo/En-tête de l'entreprise
  - Informations de l'entreprise
  - Informations du client
  - Liste détaillée des produits
  - Totaux HT / TVA / TTC
  - Date et numéro de facture
  - Statut de la facture

### 📊 Tableau de Bord (Dashboard)
- ✅ Nombre total de factures
- ✅ Chiffre d'affaires global (factures payées)
- ✅ Nombre de factures payées / impayées
- ✅ Graphique des revenus par mois (12 derniers mois)
- ✅ Nombre total de clients
- ✅ Nombre total de produits
- ✅ Cartes statistiques avec icônes

### 🔍 Recherche et Filtres
- ✅ Recherche dans les clients (nom, email)
- ✅ Recherche dans les produits (nom, description)
- ✅ Recherche dans les factures (numéro, nom client)
- ✅ Filtres de factures par :
  - Client
  - Statut
  - Date (début et fin)

### 🎨 Interface Utilisateur
- ✅ Design professionnel et moderne
- ✅ Interface responsive (desktop + mobile)
- ✅ Navigation intuitive avec sidebar
- ✅ Modales pour les formulaires
- ✅ Messages d'erreur et de confirmation
- ✅ Badges de statut colorés
- ✅ Animations et transitions fluides

### 🗄️ Base de Données
- ✅ SQLite avec structure complète
- ✅ Tables : users, clients, produits, factures, details_facture
- ✅ Relations et contraintes d'intégrité
- ✅ Création automatique de la base au démarrage
- ✅ Utilisateur admin par défaut

## 🚀 Technologies Utilisées

### Backend
- Node.js
- Express.js
- SQLite3
- JWT (jsonwebtoken)
- bcryptjs
- PDFKit

### Frontend
- React 18
- React Router DOM
- Axios
- Recharts (graphiques)
- React Icons

## 📱 Responsive Design
- ✅ Desktop (≥ 768px) : Layout complet avec sidebar fixe
- ✅ Mobile (< 768px) : Sidebar rétractable, tableaux scrollables, formulaires adaptés

## 🔒 Sécurité
- ✅ Hashage des mots de passe
- ✅ Tokens JWT avec expiration
- ✅ Protection des routes API
- ✅ Validation des données côté serveur
- ✅ Gestion des erreurs

## 📝 Cas d'Utilisation Supportés

1. ✅ L'admin se connecte
2. ✅ Ajoute un client
3. ✅ Ajoute des services/produits
4. ✅ Crée une facture avec plusieurs produits
5. ✅ Télécharge le PDF de la facture
6. ✅ Marque la facture comme payée
7. ✅ Consulte les statistiques sur le dashboard
8. ✅ Recherche et filtre les factures
9. ✅ Modifie une facture existante
10. ✅ Supprime une facture

## 🎯 Prêt pour Portfolio/CV

- ✅ Code propre et structuré
- ✅ Architecture claire (séparation front/back)
- ✅ API REST bien organisée
- ✅ Composants React réutilisables
- ✅ Documentation complète
- ✅ Projet fonctionnel de bout en bout
