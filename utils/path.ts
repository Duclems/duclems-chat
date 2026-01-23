/**
 * Utilitaire pour gérer les chemins avec basePath pour GitHub Pages
 * Détecte automatiquement l'environnement de développement
 */
export function getBasePath(): string {
  // Détecter si on est en développement (localhost)
  if (typeof window !== 'undefined') {
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === ''
    
    // En développement, pas de basePath
    if (isDevelopment) {
      return ''
    }
    
    // En production, utiliser la variable d'environnement si disponible
    const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH
    if (envBasePath) {
      return envBasePath
    }
    
    // Sinon, essayer de détecter depuis l'URL (pour GitHub Pages)
    const pathname = window.location.pathname
    // Si on est sur GitHub Pages avec un sous-dossier, le pathname commence par /nom-du-repo/
    const match = pathname.match(/^\/([^\/]+)/)
    if (match && match[1] !== '') {
      // Ne pas utiliser 'index.html' ou autres fichiers comme basePath
      const firstSegment = match[1]
      if (!firstSegment.includes('.') && firstSegment !== '') {
        return `/${firstSegment}`
      }
    }
  }
  
  // Côté serveur : détecter via NODE_ENV
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return ''
  }
  
  // Valeur par défaut pour la production
  return process.env.NEXT_PUBLIC_BASE_PATH || '/duclems-chat'
}

/**
 * Construit un chemin complet avec le basePath
 * @param path - Le chemin relatif (doit commencer par /)
 * @returns Le chemin complet avec basePath
 */
export function getPath(path: string): string {
  const basePath = getBasePath()
  // Si le path commence déjà par le basePath, ne pas le dupliquer
  if (path.startsWith(basePath)) {
    return path
  }
  return `${basePath}${path}`
}
