// Configuration de la chaîne Twitch
export const TWITCH_CHANNEL = 'duclems' //remplacer par le nom de la chaîne souhaitée

// Configuration des couleurs selon les périodes (par défaut, sera remplacé par le fichier JSON)
export const THEME_COLORS = {
  default: '#fa1167',      // #fa1167 pour les jours normaux
  halloween: '#ff6b35',    //rgb(250, 102, 17) Orange pour Halloween
  noel: '#fa1167',         // #fa1167 pour Noël 
  paques: '#f39c12',       //rgb(56, 250, 17) Jaune/Orange pour Pâques
}

// Fonction pour calculer la date de Pâques (algorithme de Gauss)
function getEasterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

// Interface pour les thèmes
export interface ThemePeriod {
  type?: 'easter'
  startMonth?: number
  startDay?: number
  endMonth?: number
  endDay?: number
  daysBefore?: number
  daysAfter?: number
}

export interface Theme {
  name: string
  color: string
  periods: ThemePeriod[]
}

// Fonction pour obtenir la couleur de thème selon la date actuelle et les thèmes configurés
export function getThemeColor(themes: Theme[] = []): string {
  // Forcer l'utilisation du thème principal ("default") et ignorer les autres thèmes.
  const defaultTheme = themes.find(t => t.name === 'default')
  return defaultTheme?.color || THEME_COLORS.default
}
