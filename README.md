# Twitch Chat Board

Application de chat Twitch avec overlay et gestion de pseudonymes personnalisés.

## Fonctionnalités

- **Chat Twitch en temps réel** : Affichage des messages du chat Twitch via TMI.js (sans authentification)
- **Overlay** : Composants overlay pour shoutout, follow, sub, etc.
- **Gestion des pseudonymes** : Personnalisation des noms d'affichage avec renommage
- **Thèmes personnalisables** : Système de thèmes avec périodes (Halloween, Noël, Pâques, etc.)
- **Couronne personnalisée** : Affichage d'une couronne pour certains utilisateurs avec animation
- **Couleurs par rôle** : 
  - Lead Modérateur : #912755
  - Modérateur : #3c9127
  - VIP : rgb(140, 12, 151)
  - Autres : Rouge vif (#ff0000)

## Technologies

- Next.js 14
- React 18
- TypeScript
- TMI.js (Twitch Messaging Interface)
- GSAP (animations)
- Tailwind CSS

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Configuration

Modifiez `config.ts` pour configurer le canal Twitch :

```typescript
export const TWITCH_CHANNEL = 'votre_canal'
```

## Pages

- `/` : Chat principal
- `/overlay` : Page overlay pour OBS
- `/custom` : Gestion des pseudonymes et thèmes

## Structure

- `app/` : Pages Next.js
- `components/` : Composants React
- `data/` : Fichiers de données (CSV, JSON)
- `public/` : Assets statiques

## Déploiement sur GitHub Pages

### ⚠️ Important

GitHub Pages ne supporte que les sites statiques. Les API routes Next.js (`/api/save-custom-names` et `/api/save-themes`) **ne fonctionneront pas** sur GitHub Pages. L'application fonctionnera en lecture seule (affichage du chat et des overlays), mais la sauvegarde des pseudonymes et thèmes ne sera pas disponible.

Pour une fonctionnalité complète, considérez d'utiliser [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) qui supportent les API routes Next.js.

### Configuration

1. **Définir la variable d'environnement** :
   - Dans GitHub Actions : définie dans `.github/workflows/deploy.yml`
   - Pour un build local : créez un fichier `.env.local` :
     ```bash
     # Si votre dépôt est "duclems-chat", utilisez:
     NEXT_PUBLIC_BASE_PATH=/duclems-chat
     
     # Si votre dépôt est "username.github.io" (dépôt spécial), laissez vide:
     # NEXT_PUBLIC_BASE_PATH=
     ```

2. **Build et déploiement** :
   ```bash
   # Avec la variable d'environnement
   NEXT_PUBLIC_BASE_PATH=/duclems-chat npm run build
   ```

3. **Activer GitHub Pages** :
   - Allez dans Settings > Pages de votre dépôt GitHub
   - Source : "GitHub Actions"

### Notes importantes

- Le `basePath` dans `next.config.js` doit correspondre au nom de votre dépôt GitHub
- Tous les chemins absolus (`/data/...`, `/images/...`) seront automatiquement préfixés avec le `basePath`
- Les polices et autres assets statiques sont également gérés automatiquement
- Pour le développement local, vous pouvez laisser `NEXT_PUBLIC_BASE_PATH` vide ou non définie
- **Les fichiers de données doivent être dans `public/data/` pour être accessibles sur GitHub Pages**