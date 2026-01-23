# Instructions pour créer le dépôt GitHub "duclems-chat"

## Étape 1 : Installer Git (si pas déjà installé)

Téléchargez Git depuis : https://git-scm.com/download/win

## Étape 2 : Créer le dépôt sur GitHub

1. Allez sur https://github.com/new
2. Nom du dépôt : `duclems-chat`
3. Description : "Twitch Chat Board - Application de chat Twitch avec overlay"
4. Choisissez Public ou Private
5. **NE PAS** cocher "Initialize this repository with a README" (on a déjà un README)
6. Cliquez sur "Create repository"

## Étape 3 : Initialiser Git localement

Ouvrez PowerShell ou Git Bash dans le dossier du projet et exécutez :

```bash
# Initialiser git
git init

# Ajouter tous les fichiers
git add .

# Faire le commit initial
git commit -m "Initial commit: Twitch Chat Board"

# Renommer la branche principale en main (si nécessaire)
git branch -M main

# Ajouter le dépôt distant (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/duclems-chat.git

# Pousser le code
git push -u origin main
```

## Alternative : Utiliser GitHub CLI (si installé)

Si vous avez GitHub CLI installé :

```bash
gh repo create duclems-chat --public --source=. --remote=origin --push
```

## Vérification

Après avoir poussé, vérifiez que tout est bien sur GitHub :
https://github.com/VOTRE_USERNAME/duclems-chat
