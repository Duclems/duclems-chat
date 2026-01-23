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
