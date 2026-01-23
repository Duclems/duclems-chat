import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { themes } = await request.json()

    // Chemin vers le fichier de données
    const dataDir = path.join(process.cwd(), 'data')
    const publicDataDir = path.join(process.cwd(), 'public', 'data')
    
    // Créer les dossiers s'ils n'existent pas
    await fs.mkdir(dataDir, { recursive: true })
    await fs.mkdir(publicDataDir, { recursive: true })

    const dataPath = path.join(dataDir, 'themes.json')
    const publicPath = path.join(publicDataDir, 'themes.json')

    const themesData = JSON.stringify({ themes }, null, 2)

    // Sauvegarder dans les deux emplacements
    await fs.writeFile(dataPath, themesData, 'utf-8')
    await fs.writeFile(publicPath, themesData, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des thèmes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    )
  }
}

