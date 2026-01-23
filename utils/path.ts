/**
 * Utilitaire pour gérer les chemins avec basePath pour GitHub Pages
 * Récupère le basePath depuis la variable d'environnement ou utilise la valeur par défaut
 */
export function getBasePath(): string {
  if (typeof window !== 'undefined') {
    // Côté client, on peut utiliser window.location pour détecter le basePath
    // ou utiliser la variable d'environnement si elle est disponible
    const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH
    if (envBasePath) {
      return envBasePath
    }
    
    // Sinon, essayer de détecter depuis l'URL
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
  
  // Valeur par défaut ou côté serveur
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
