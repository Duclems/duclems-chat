// Configuration de la chaîne Twitch
export const TWITCH_CHANNEL = 'duclems' //remplacer par le nom de la chaîne souhaitée

// Configuration des couleurs selon les périodes (par défaut, sera remplacé par le fichier JSON)
export const THEME_COLORS = {
  default: '#9810fa',      // #9810fa pour les jours normaux
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
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()
  const year = now.getFullYear()

  // Si des thèmes sont fournis, les utiliser
  if (themes.length > 0) {
    // Trouver le thème par défaut
    const defaultTheme = themes.find(t => t.name === 'default')
    let defaultColor = defaultTheme?.color || THEME_COLORS.default

    // Parcourir tous les thèmes (sauf default) pour trouver une correspondance
    for (const theme of themes) {
      if (theme.name === 'default') continue

      for (const period of theme.periods) {
        if (period.type === 'easter') {
          // Période relative à Pâques
          const easterDate = getEasterDate(year)
          const easterTime = easterDate.getTime()
          const nowTime = now.getTime()
          const daysDiff = Math.floor((nowTime - easterTime) / (1000 * 60 * 60 * 24))
          const daysBefore = period.daysBefore || 14
          const daysAfter = period.daysAfter || 14
          
          if (daysDiff >= -daysBefore && daysDiff <= daysAfter) {
            return theme.color
          }
        } else if (period.startMonth && period.startDay && period.endMonth && period.endDay) {
          // Période fixe
          const startDate = new Date(year, period.startMonth - 1, period.startDay)
          const endDate = new Date(year, period.endMonth - 1, period.endDay)
          const currentDate = new Date(year, month - 1, day)

          // Gérer le cas où la période traverse l'année
          if (endDate < startDate) {
            // La période traverse l'année (ex: 20 déc - 5 jan)
            if (currentDate >= startDate || currentDate <= endDate) {
              return theme.color
            }
          } else {
            // Période normale
            if (currentDate >= startDate && currentDate <= endDate) {
              return theme.color
            }
          }
        }
      }
    }

    return defaultColor
  }

  // Fallback vers l'ancienne logique si pas de thèmes
  // Halloween : 20 octobre - 5 novembre
  if (month === 10 && day >= 20) {
    return THEME_COLORS.halloween
  }
  if (month === 11 && day <= 5) {
    return THEME_COLORS.halloween
  }

  // Noël : 1 décembre - 31 décembre
  if (month === 12) {
    return THEME_COLORS.noel
  }

  // Pâques : 2 semaines avant et après la date de Pâques
  const easterDate = getEasterDate(year)
  const easterTime = easterDate.getTime()
  const nowTime = now.getTime()
  const daysDiff = Math.floor((nowTime - easterTime) / (1000 * 60 * 60 * 24))
  
  if (daysDiff >= -14 && daysDiff <= 14) {
    return THEME_COLORS.paques
  }

  // Couleur par défaut pour les autres jours
  return THEME_COLORS.default
}
