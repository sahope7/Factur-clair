# Guide d'Installation - FacturÉclair

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement inclus avec Node.js)

## Installation

### Option 1 : Script PowerShell (Recommandé pour Windows)

Depuis PowerShell, dans le répertoire du projet :

```powershell
.\install.ps1
```

### Option 2 : Installation manuelle

#### 1. Installer les dépendances racine

```bash
npm install
```

#### 2. Installer les dépendances du serveur

```bash
cd server
npm install
cd ..
```

#### 3. Installer les dépendances du client

```bash
cd client
npm install
cd ..
```

### Option 3 : Commandes npm séparées

```bash
npm install
npm run install-server
npm run install-client
```

## Configuration

Le backend utilise SQLite qui sera créé automatiquement au premier démarrage.

Pour personnaliser la configuration, créez un fichier `.env` dans le dossier `server/` :

```env
PORT=5001
JWT_SECRET=votre_secret_jwt_super_securise
```

## Démarrer l'application

### Démarrer backend et frontend ensemble

```bash
npm run dev
```

### Démarrer séparément

**Terminal 1 - Backend :**
```bash
cd server
npm start
```

**Terminal 2 - Frontend :**
```bash
cd client
npm start
```

## Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5001

## Compte par défaut

- **Email** : admin@factureclair.com
- **Mot de passe** : admin123

⚠️ **Important** : Changez ce mot de passe en production !

## Structure de la base de données

La base de données SQLite (`server/database.db`) est créée automatiquement avec les tables suivantes :

- `users` - Utilisateurs de l'application
- `clients` - Clients
- `produits` - Produits/Services
- `factures` - Factures
- `details_facture` - Détails des lignes de facture

## Commandes utiles

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Construire le frontend pour la production
- `npm run install-server` - Installer uniquement les dépendances serveur
- `npm run install-client` - Installer uniquement les dépendances client
- `cd server && npm start` - Démarrer uniquement le backend
- `cd client && npm start` - Démarrer uniquement le frontend

## Dépannage

### Port déjà utilisé

Si le port 5001 est déjà utilisé, modifiez le port dans `server/index.js` ou via la variable d'environnement `PORT`.

### Erreurs de dépendances

Supprimez les dossiers `node_modules` et réinstallez :

**Windows (PowerShell) :**
```powershell
Remove-Item -Recurse -Force node_modules, server\node_modules, client\node_modules
.\install.ps1
```

**Linux/Mac :**
```bash
rm -rf node_modules server/node_modules client/node_modules
npm install && cd server && npm install && cd ../client && npm install
```

### Base de données corrompue

Supprimez le fichier `server/database.db` et redémarrez l'application. La base sera recréée automatiquement.

### Module 'cors' introuvable

Si vous obtenez l'erreur "Cannot find module 'cors'", cela signifie que les dépendances du serveur ne sont pas installées. Exécutez :

```bash
cd server
npm install
```
