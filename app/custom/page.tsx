'use client'

import { useState, useEffect } from 'react'
import { getPath } from '@/utils/path'

interface CustomName {
  pseudonyme: string
  rename: string
  showCrown?: boolean
}

interface ThemePeriod {
  type?: 'easter'
  startMonth?: number
  startDay?: number
  endMonth?: number
  endDay?: number
  daysBefore?: number
  daysAfter?: number
}

interface Theme {
  name: string
  color: string
  periods: ThemePeriod[]
}

export default function CustomPage() {
  const [customNames, setCustomNames] = useState<CustomName[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingThemes, setSavingThemes] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string>('')
  const [saveThemesMessage, setSaveThemesMessage] = useState<string>('')
  const [newPseudonyme, setNewPseudonyme] = useState('')
  const [newRename, setNewRename] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editPseudonyme, setEditPseudonyme] = useState('')
  const [editRename, setEditRename] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingThemeIndex, setEditingThemeIndex] = useState<number | null>(null)

  useEffect(() => {
    // Charger le fichier CSV
    fetch(getPath('/data/custom-names.csv'))
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(';')
        const data: CustomName[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(';')
          if (values.length >= 2) {
            data.push({
              pseudonyme: values[0].trim(),
              rename: values[1]?.trim() || '',
              showCrown: values[2]?.trim() === 'true' || values[2]?.trim() === '1'
            })
          }
        }

        // Trier par ordre alphabétique par pseudonyme
        const sortedData = data.sort((a, b) => 
          a.pseudonyme.localeCompare(b.pseudonyme, 'fr', { sensitivity: 'base' })
        )
        setCustomNames(sortedData)
      })
      .catch(error => {
        console.error('Erreur lors du chargement du CSV:', error)
      })

    // Charger les thèmes
    fetch(getPath('/data/themes.json'))
      .then(response => response.json())
      .then(data => {
        setThemes(data.themes || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des thèmes:', error)
        setLoading(false)
      })
  }, [])

  const handleAdd = () => {
    if (!newPseudonyme.trim()) return

    const newItem: CustomName = {
      pseudonyme: newPseudonyme.trim(),
      rename: newRename.trim(),
      showCrown: false
    }

    // Ajouter et trier par ordre alphabétique
    const updated = [...customNames, newItem].sort((a, b) => 
      a.pseudonyme.localeCompare(b.pseudonyme, 'fr', { sensitivity: 'base' })
    )
    setCustomNames(updated)
    setNewPseudonyme('')
    setNewRename('')
  }

  const [editShowCrown, setEditShowCrown] = useState(false)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditPseudonyme(customNames[index].pseudonyme)
    setEditRename(customNames[index].rename)
    setEditShowCrown(customNames[index].showCrown || false)
  }

  const handleSaveEdit = (index: number) => {
    if (!editPseudonyme.trim()) return

    // Modifier et trier par ordre alphabétique
    const updated = [...customNames]
    updated[index] = {
      pseudonyme: editPseudonyme.trim(),
      rename: editRename.trim(),
      showCrown: editShowCrown
    }
    const sorted = updated.sort((a, b) => 
      a.pseudonyme.localeCompare(b.pseudonyme, 'fr', { sensitivity: 'base' })
    )
    setCustomNames(sorted)
    // Trouver le nouvel index après le tri
    const newIndex = sorted.findIndex(item => 
      item.pseudonyme === editPseudonyme.trim() && item.rename === editRename.trim()
    )
    setEditingIndex(null)
    setEditPseudonyme('')
    setEditRename('')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditPseudonyme('')
    setEditRename('')
    setEditShowCrown(false)
  }

  const handleToggleCrown = (index: number) => {
    const updated = [...customNames]
    updated[index] = {
      ...updated[index],
      showCrown: !updated[index].showCrown
    }
    setCustomNames(updated)
  }

  // Fonction pour obtenir la liste filtrée et triée
  const getFilteredAndSortedNames = (): CustomName[] => {
    let filtered = customNames

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.pseudonyme.toLowerCase().includes(query) || 
        item.rename.toLowerCase().includes(query)
      )
    }

    // Trier par ordre alphabétique
    return filtered.sort((a, b) => 
      a.pseudonyme.localeCompare(b.pseudonyme, 'fr', { sensitivity: 'base' })
    )
  }

  const filteredAndSortedNames = getFilteredAndSortedNames()

  const handleDelete = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      // Utiliser l'index de la liste filtrée pour trouver l'élément dans la liste complète
      const itemToDelete = filteredAndSortedNames[index]
      const updated = customNames.filter(item => 
        item.pseudonyme !== itemToDelete.pseudonyme || item.rename !== itemToDelete.rename
      )
      setCustomNames(updated)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage('')

    // Construire le contenu CSV
    const csvContent = [
      'pseudonyme;rename;showCrown',
      ...customNames.map(item => `${item.pseudonyme};${item.rename || ''};${item.showCrown ? 'true' : 'false'}`)
    ].join('\n')

    try {
      const response = await fetch(getPath('/api/save-custom-names'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvContent }),
      })

      if (response.ok) {
        setSaveMessage('✅ Sauvegardé avec succès!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('❌ Erreur lors de la sauvegarde')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur lors de la sauvegarde')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTheme = (index: number, updatedTheme: Theme) => {
    const updated = [...themes]
    updated[index] = updatedTheme
    setThemes(updated)
    setEditingThemeIndex(null)
  }

  const handleSaveThemes = async () => {
    setSavingThemes(true)
    setSaveThemesMessage('')

    try {
      const response = await fetch(getPath('/api/save-themes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ themes }),
      })

      if (response.ok) {
        setSaveThemesMessage('✅ Thèmes sauvegardés avec succès!')
        setTimeout(() => setSaveThemesMessage(''), 3000)
      } else {
        setSaveThemesMessage('❌ Erreur lors de la sauvegarde')
        setTimeout(() => setSaveThemesMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveThemesMessage('❌ Erreur lors de la sauvegarde')
      setTimeout(() => setSaveThemesMessage(''), 3000)
    } finally {
      setSavingThemes(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-300">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto p-8 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Gestion des pseudonymes et thèmes</h1>
        
        {/* Section Thèmes */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Gestion des thèmes</h2>
          
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={handleSaveThemes}
              disabled={savingThemes}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
            >
              {savingThemes ? 'Sauvegarde...' : 'Sauvegarder les thèmes'}
            </button>
            {saveThemesMessage && (
              <span className="text-sm font-medium text-gray-300">{saveThemesMessage}</span>
            )}
          </div>

          <div className="space-y-4">
            {themes.map((theme, index) => (
              <div
                key={theme.name}
                className="p-4 bg-gray-700 border border-gray-600 rounded-lg"
              >
                {editingThemeIndex === index ? (
                  <ThemeEditForm
                    theme={theme}
                    onSave={(updatedTheme) => handleSaveTheme(index, updatedTheme)}
                    onCancel={() => setEditingThemeIndex(null)}
                  />
                ) : (
                  <ThemeDisplay
                    theme={theme}
                    onEdit={() => setEditingThemeIndex(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section Pseudonymes */}
        <h2 className="text-2xl font-semibold mb-4 text-white">Gestion des pseudonymes</h2>
        
        {/* Formulaire d'ajout en haut */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Ajouter un nouveau pseudonyme</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pseudonyme
              </label>
              <input
                type="text"
                value={newPseudonyme}
                onChange={(e) => setNewPseudonyme(e.target.value)}
                placeholder="Nom du pseudonyme"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Renommer en
              </label>
              <input
                type="text"
                value={newRename}
                onChange={(e) => setNewRename(e.target.value)}
                placeholder="Nouveau nom (optionnel)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          {saveMessage && (
            <span className="text-sm font-medium text-gray-300">{saveMessage}</span>
          )}
        </div>

        {/* Liste des pseudonymes */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Barre de recherche */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un pseudonyme ou un rename..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            {filteredAndSortedNames.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {customNames.length === 0 ? 'Aucun pseudonyme ajouté' : 'Aucun résultat trouvé'}
              </p>
            ) : (
              filteredAndSortedNames.map((item, index) => {
                // Trouver l'index réel dans la liste complète pour l'édition
                const realIndex = customNames.findIndex(customItem => 
                  customItem.pseudonyme === item.pseudonyme && customItem.rename === item.rename
                )
                return (
                <div
                  key={`${item.pseudonyme}-${item.rename}-${realIndex}`}
                  className="flex items-center gap-4 p-4 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {editingIndex === realIndex ? (
                    <>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editPseudonyme}
                          onChange={(e) => setEditPseudonyme(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editRename}
                          onChange={(e) => setEditRename(e.target.value)}
                          placeholder="Nouveau nom (optionnel)"
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-300">Couronne</label>
                        <input
                          type="checkbox"
                          checked={editShowCrown}
                          onChange={(e) => setEditShowCrown(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveEdit(realIndex)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Valider
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Pseudonyme
                        </label>
                        <p className="text-white font-medium">{item.pseudonyme}</p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Renommer en
                        </label>
                        <p className="text-gray-300">{item.rename || '-'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-300">Couronne</label>
                        <input
                          type="checkbox"
                          checked={item.showCrown || false}
                          onChange={() => handleToggleCrown(realIndex)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => handleEdit(realIndex)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant pour afficher un thème
function ThemeDisplay({ theme, onEdit }: { theme: Theme; onEdit: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white capitalize">{theme.name}</h3>
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
        >
          Modifier
        </button>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-400 mb-1">Périodes:</p>
        {theme.periods.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune période (thème par défaut)</p>
        ) : (
          <div className="space-y-1">
            {theme.periods.map((period, idx) => (
              <div key={idx} className="text-sm text-gray-300">
                {period.type === 'easter' ? (
                  <span>Pâques: {period.daysBefore} jours avant - {period.daysAfter} jours après</span>
                ) : (
                  <span>
                    {period.startMonth}/{period.startDay} - {period.endMonth}/{period.endDay}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour éditer un thème
function ThemeEditForm({ theme, onSave, onCancel }: { theme: Theme; onSave: (theme: Theme) => void; onCancel: () => void }) {
  const [periods, setPeriods] = useState<ThemePeriod[]>(theme.periods)

  const handleAddPeriod = () => {
    setPeriods([...periods, {}])
  }

  const handleRemovePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index))
  }

  const handleUpdatePeriod = (index: number, updatedPeriod: ThemePeriod) => {
    const updated = [...periods]
    updated[index] = updatedPeriod
    setPeriods(updated)
  }

  const handleSave = () => {
    onSave({
      ...theme,
      periods: periods.filter(p => 
        (p.type === 'easter' && p.daysBefore !== undefined && p.daysAfter !== undefined) ||
        (p.startMonth !== undefined && p.startDay !== undefined && p.endMonth !== undefined && p.endDay !== undefined)
      )
    })
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Périodes
          </label>
          <button
            onClick={handleAddPeriod}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            + Ajouter période
          </button>
        </div>
        <div className="space-y-2">
          {periods.map((period, idx) => (
            <PeriodEditForm
              key={idx}
              period={period}
              onUpdate={(updated) => handleUpdatePeriod(idx, updated)}
              onRemove={() => handleRemovePeriod(idx)}
            />
          ))}
          {periods.length === 0 && (
            <p className="text-gray-500 text-sm">Aucune période (thème par défaut si aucune période ne correspond)</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Valider
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

// Composant pour éditer une période
function PeriodEditForm({ period, onUpdate, onRemove }: { period: ThemePeriod; onUpdate: (period: ThemePeriod) => void; onRemove: () => void }) {
  const [type, setType] = useState<'easter' | 'date'>(period.type === 'easter' ? 'easter' : 'date')
  const [startMonth, setStartMonth] = useState(period.startMonth || 1)
  const [startDay, setStartDay] = useState(period.startDay || 1)
  const [endMonth, setEndMonth] = useState(period.endMonth || 12)
  const [endDay, setEndDay] = useState(period.endDay || 31)
  const [daysBefore, setDaysBefore] = useState(period.daysBefore || 14)
  const [daysAfter, setDaysAfter] = useState(period.daysAfter || 14)

  useEffect(() => {
    if (type === 'easter') {
      onUpdate({ type: 'easter', daysBefore, daysAfter })
    } else {
      onUpdate({ startMonth, startDay, endMonth, endDay })
    }
  }, [type, startMonth, startDay, endMonth, endDay, daysBefore, daysAfter, onUpdate])

  return (
    <div className="p-3 bg-gray-600 rounded border border-gray-500">
      <div className="flex items-center justify-between mb-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'easter' | 'date')}
          className="px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm"
        >
          <option value="date">Période fixe (mois/jour)</option>
          <option value="easter">Période relative à Pâques</option>
        </select>
        <button
          onClick={onRemove}
          className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>
      {type === 'easter' ? (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={daysBefore}
            onChange={(e) => setDaysBefore(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm"
            placeholder="Jours avant"
          />
          <span className="text-gray-300 text-sm">jours avant Pâques -</span>
          <input
            type="number"
            value={daysAfter}
            onChange={(e) => setDaysAfter(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm"
            placeholder="Jours après"
          />
          <span className="text-gray-300 text-sm">jours après Pâques</span>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            max="12"
            value={startMonth}
            onChange={(e) => setStartMonth(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm"
            placeholder="Mois début"
          />
          <span className="text-gray-300">/</span>
          <input
            type="number"
            min="1"
            max="31"
            value={startDay}
            onChange={(e) => setStartDay(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm"
            placeholder="Jour début"
          />
          <span className="text-gray-300">-</span>
          <input
            type="number"
            min="1"
            max="12"
            value={endMonth}
            onChange={(e) => setEndMonth(parseInt(e.target.value) || 12)}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm"
            placeholder="Mois fin"
          />
          <span className="text-gray-300">/</span>
          <input
            type="number"
            min="1"
            max="31"
            value={endDay}
            onChange={(e) => setEndDay(parseInt(e.target.value) || 31)}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm"
            placeholder="Jour fin"
          />
        </div>
      )}
    </div>
  )
}

