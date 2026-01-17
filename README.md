# FacturÉclair - Application de Facturation Professionnelle

Application web complète de gestion de facturation destinée aux freelances et petites entreprises.

## 🚀 Fonctionnalités

- ✅ Gestion des clients (CRUD complet)
- ✅ Gestion des produits/services (CRUD complet)
- ✅ Création et suivi des factures
- ✅ Calcul automatique (HT, TVA, TTC)
- ✅ Génération de factures PDF professionnelles
- ✅ Tableau de bord avec statistiques
- ✅ Authentification sécurisée
- ✅ Interface responsive

## 🛠️ Technologies

- **Frontend**: React, React Router, Axios, Recharts
- **Backend**: Node.js, Express
- **Base de données**: SQLite
- **Authentification**: JWT, bcrypt

## 📦 Installation

1. Installer toutes les dépendances :
```bash
npm run install-all
```

2. Démarrer l'application (backend + frontend) :
```bash
npm run dev
```

L'application sera accessible sur :
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 🔐 Compte par défaut

- **Email**: admin@factureclair.com
- **Mot de passe**: admin123

## 📁 Structure du projet

```
FacturÉclair/
├── server/          # Backend Node.js/Express
│   ├── config/      # Configuration base de données
│   ├── models/      # Modèles de données
│   ├── routes/      # Routes API
│   ├── middleware/  # Middleware (auth, etc.)
│   └── utils/       # Utilitaires (PDF, etc.)
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
└── package.json
```

## 📄 Licence

ISC
