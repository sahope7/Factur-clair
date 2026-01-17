# Script d'installation pour FacturÉclair
# Installe toutes les dépendances du projet

Write-Host "📦 Installation des dépendances..." -ForegroundColor Cyan

# Installation des dépendances racine
Write-Host "`n1. Installation des dépendances racine..." -ForegroundColor Yellow
npm install

# Installation des dépendances serveur
Write-Host "`n2. Installation des dépendances serveur..." -ForegroundColor Yellow
Push-Location server
npm install
Pop-Location

# Installation des dépendances client
Write-Host "`n3. Installation des dépendances client..." -ForegroundColor Yellow
Push-Location client
npm install
Pop-Location

Write-Host "`n✅ Installation terminée avec succès!" -ForegroundColor Green
Write-Host "`nPour démarrer l'application, exécutez: npm run dev" -ForegroundColor Cyan
