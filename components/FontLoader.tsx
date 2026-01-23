'use client'

import { useEffect } from 'react'
import { getBasePath } from '@/utils/path'

export default function FontLoader() {
  useEffect(() => {
    // Charger les polices dynamiquement avec le bon basePath
    const basePath = getBasePath()
    
    // Créer les définitions @font-face
    const oliverPath = basePath ? `${basePath}/Oliver-Regular.ttf` : '/Oliver-Regular.ttf'
    const figtreePath = basePath ? `${basePath}/Figtree-Bold.ttf` : '/Figtree-Bold.ttf'
    
    // Vérifier si les polices sont déjà définies
    const existingStyle = document.getElementById('dynamic-fonts')
    if (existingStyle) {
      existingStyle.remove()
    }
    
    // Créer un élément style avec les définitions de polices
    const style = document.createElement('style')
    style.id = 'dynamic-fonts'
    style.textContent = `
      @font-face {
        font-family: 'Oliver Regular';
        src: url('${oliverPath}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Figtree Bold';
        src: url('${figtreePath}') format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `
    
    document.head.appendChild(style)
    
    // Nettoyer lors du démontage
    return () => {
      const styleToRemove = document.getElementById('dynamic-fonts')
      if (styleToRemove) {
        styleToRemove.remove()
      }
    }
  }, [])
  
  return null
}
