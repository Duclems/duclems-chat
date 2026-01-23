import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { csvContent } = body

    if (!csvContent) {
      return NextResponse.json(
        { error: 'Contenu CSV manquant' },
        { status: 400 }
      )
    }

    // Chemin vers le fichier CSV
    const filePath = join(process.cwd(), 'data', 'custom-names.csv')

    // Écrire le fichier
    await writeFile(filePath, csvContent, 'utf-8')

    // Copier aussi dans public pour que le frontend puisse le lire
    const publicPath = join(process.cwd(), 'public', 'data', 'custom-names.csv')
    await writeFile(publicPath, csvContent, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    )
  }
}

