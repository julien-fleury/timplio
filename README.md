# Timplio

<p align="center">
  <img src="src/renderer/src/assets/timplio-logo.png" alt="Logo Timplio" width="520">
</p>

Application de bureau locale pour suivre les affaires, les pointages et la rentabilité.

## Fonctions principales

- tableau de bord, alertes de rentabilité et prévisions à l’échéance ;
- saisie individuelle ou hebdomadaire et modification des pointages ;
- budgets d’heures par catégorie ;
- export et import Excel, rapports PDF par affaire ;
- sauvegarde SQLite manuelle et sauvegarde quotidienne automatique ;
- migrations automatiques des anciennes bases.

## Prérequis

- Node.js 22 LTS
- pnpm, npm ou yarn

## Développement

```bash
npm install
npm run dev
```

## Vérification

```bash
npm run typecheck
npm test
```

## Compilation

```bash
npm run build
```

Les installateurs sont générés dans `release/`. La compilation Windows doit être réalisée sous Windows pour produire l’installeur `.exe`; la compilation macOS produit un `.dmg` et un `.zip`.

### Préparation Windows automatisée

Sur Windows 10 ou 11, double-cliquer sur `INSTALLER-WINDOWS.cmd`. Le lanceur :

1. installe `fnm`, Node.js 22 et pnpm si nécessaire ;
2. installe les dépendances du projet ;
3. vérifie TypeScript et exécute les tests ;
4. génère l’installeur Windows 64 bits ;
5. ouvre l’Explorateur sur le fichier `.exe` obtenu dans `release`.

Cette préparation nécessite une connexion Internet. Elle utilise normalement Windows Package Manager (`winget`) ; si sa source est indisponible, le lanceur télécharge automatiquement `fnm` depuis sa publication GitHub officielle. L’utilisateur final de Timplio n’a besoin que de l’installeur `.exe` produit.

SQLite est fourni directement par Electron : Python et Visual Studio Build Tools ne sont pas nécessaires pour compiler l’application sous Windows.

## Données

La base SQLite est créée au premier lancement dans le dossier `userData` d’Electron. L’écran **Données** permet l’export Excel, la sauvegarde et la restauration de la base.

Lors du premier lancement de Timplio, une éventuelle base de l’ancienne application **CMS Temps** est copiée automatiquement avec ses sauvegardes quotidiennes. Les fichiers historiques sont conservés par sécurité.

## Versions locales avec Git

Le projet est suivi dans un dépôt Git local. Avant de produire une nouvelle mise à jour :

1. modifier le numéro `version` dans `package.json` (par exemple `2.0.1`) ;
2. vérifier puis enregistrer les changements avec `git add .` et `git commit` ;
3. créer un repère correspondant (par exemple `git tag v2.0.1`) ;
4. générer le nouvel installateur avec `INSTALLER-WINDOWS.cmd`.

Les fichiers de compilation, les dépendances et les bases SQLite sont exclus du dépôt.
