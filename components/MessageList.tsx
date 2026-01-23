'use client'

import { ChatMessage } from './ChatContainer'
import { RefObject, useRef, useState, useEffect, useCallback } from 'react'
import SplitText from './SplitText'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { getPath } from '@/utils/path'

interface MessageListProps {
  messages: ChatMessage[]
  messagesEndRef: RefObject<HTMLDivElement>
  borderWidth: number | null
  fontSize: number
  offsetLeft: number
  themeColor?: string
  selectedTheme?: 'default' | 'halloween' | 'noel' | 'paques'
  spaceBetween?: number
  paddingTop?: number
  messageTimeout?: number | null
}

interface EmotePosition {
  emoteId: string
  start: number
  end: number
}

interface MessageFrameProps {
  children: React.ReactNode
  boxShadow: string
  fontSize: number
  textColor: string
  isChristmas?: boolean
  isHalloween?: boolean
  isEaster?: boolean
  themeColor: string
  isVIP?: boolean
  isModerator?: boolean
}

interface MessageItemProps {
  message: ChatMessage
  messageTimeout: number | null
  onRemove: (id: string) => void
  children: React.ReactNode
}

interface CrownFrameProps {
  themeColor: string
  fontSize: number
  hexToRgba: (hex: string, alpha?: number) => string
}

function CrownFrame({ themeColor, fontSize, hexToRgba }: CrownFrameProps) {
  const crownRef = useRef<HTMLDivElement>(null)
  const crownImageRef = useRef<HTMLImageElement>(null)
  const [crownSVG, setCrownSVG] = useState<string>('')

  // Normaliser la couleur hex pour le SVG
  const normalizeColorForSVG = (color: string): string => {
    return color.startsWith('#') ? color : `#${color}`
  }

  // Charger le SVG de la couronne avec la couleur fixe #ffd000
  useEffect(() => {
    const crownColor = '#ffd000'
    
    fetch(getPath('/images/icones/crown.svg'))
      .then(response => response.text())
      .then(svgContent => {
        // Remplacer toutes les occurrences de la couleur fill (il y a deux paths)
        let modifiedSVG = svgContent.replace(/fill="#1C274C"/g, `fill="${crownColor}"`)
        // Modifier la viewBox pour contrôler la taille (garder les proportions)
        modifiedSVG = modifiedSVG.replace(/viewBox="0 0 24 24"/g, 'viewBox="0 0 24 24"')
        // Modifier width et height pour une meilleure qualité
        modifiedSVG = modifiedSVG.replace(/width="800px" height="800px"/g, 'width="24" height="24"')
        const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
        setCrownSVG(dataURI)
      })
      .catch(error => {
        console.error('Erreur lors du chargement du SVG couronne:', error)
      })
  }, [])

  useGSAP(
    () => {
      if (crownRef.current) {
        // Animation d'apparition du cadre
        gsap.fromTo(
          crownRef.current,
          { 
            opacity: 0,
            scale: 0.8
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power1.out',
            force3D: true,
          }
        )
      }

      // Animation de rotation uniquement sur le SVG après qu'il soit chargé
      if (crownImageRef.current && crownSVG) {
        gsap.fromTo(
          crownImageRef.current,
          { rotation: -15 },
          {
            rotation: 45,
            duration: 1.5,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
            force3D: true,
          }
        )
      }
    },
    { scope: crownRef, dependencies: [crownSVG] }
  )

  return (
    <div
      ref={crownRef}
      className="bg-white border-4 border-white overflow-hidden select-none rounded-3xl flex items-center justify-center"
      style={{
        boxShadow: `inset 0 0 10px 0 ${hexToRgba(themeColor, 0.3)}`,
        padding: '0.5rem',
        position: 'absolute',
        top: '0',
        right: '0',
        transform: 'translateY(-50%)',
        zIndex: 10,
        width: '50.3px',
        height: '50.3px',
      }}
    >
      {crownSVG && (
        <img
          ref={crownImageRef}
          src={crownSVG}
          alt="crown"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  )
}

function MessageFrame({ children, boxShadow, fontSize, textColor, isChristmas = false, isHalloween = false, isEaster = false, themeColor, isVIP = false, isModerator = false }: MessageFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const [snowflakeSVG, setSnowflakeSVG] = useState<string>('')
  const [pumpkinSVG, setPumpkinSVG] = useState<string>('')
  const [easterEggSVG, setEasterEggSVG] = useState<string>('')
  const [diamondSVG, setDiamondSVG] = useState<string>('')
  const [swordSVG, setSwordSVG] = useState<string>('')

  // Normaliser la couleur hex pour le SVG
  const normalizeColorForSVG = (color: string): string => {
    return color.startsWith('#') ? color : `#${color}`
  }

  // Charger le SVG et modifier uniquement la couleur et la viewBox
  useEffect(() => {
    const colorForSVG = normalizeColorForSVG(themeColor)
    
    // Charger le diamant pour les VIP (prioritaire sur les thèmes)
    if (isVIP) {
      fetch(getPath('/images/icones/diamond-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          // Remplacer la couleur stroke (le diamant utilise stroke, pas fill)
          let modifiedSVG = svgContent.replace(/stroke="#000000"/g, `stroke="${colorForSVG}"`)
          // Modifier la viewBox pour contrôler la taille
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 24 24"/g, 'viewBox="0 0 50 50"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setDiamondSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG diamant:', error)
        })
    } else {
      setDiamondSVG('')
    }

    // Charger l'épée pour les modérateurs (prioritaire sur les thèmes)
    if (isModerator) {
      fetch(getPath('/images/icones/sword-fill-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          // Remplacer la couleur fill (l'épée utilise fill)
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          // Modifier la viewBox pour contrôler la taille
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 256 256"/g, 'viewBox="0 0 400 400"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setSwordSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG épée:', error)
        })
    } else {
      setSwordSVG('')
    }
    
    if (isChristmas && !isVIP && !isModerator) {
      fetch(getPath('/images/icones/snowflake-bold-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          // Remplacer la couleur fill et la viewBox
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 256 256"/g, 'viewBox="0 0 400 400"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setSnowflakeSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG:', error)
        })
    } else {
      setSnowflakeSVG('')
    }

    if (isHalloween && !isVIP && !isModerator) {
      fetch(getPath('/images/icones/pumkin-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          // Remplacer la couleur fill et la viewBox
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 297.002 297.002"/g, 'viewBox="0 0 550 550"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setPumpkinSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG:', error)
        })
    } else {
      setPumpkinSVG('')
    }

    if (isEaster && !isVIP && !isModerator) {
      fetch(getPath('/images/icones/easter-egg-3-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          // Remplacer la couleur fill et la viewBox
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 24 24"/g, 'viewBox="0 0 40 40"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setEasterEggSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG:', error)
        })
    } else {
      setEasterEggSVG('')
    }
  }, [isChristmas, isHalloween, isEaster, themeColor, isVIP, isModerator])
  
  // Taille du flocon (40px) + espace horizontal (20px) = 60px horizontal, 40px vertical
  const snowflakeBackgroundSize = '40px 40px'
  const diamondBackgroundSize = '40px 40px'
  const swordBackgroundSize = '40px 40px'

  useGSAP(
    () => {
      if (frameRef.current) {
        gsap.fromTo(
          frameRef.current,
          { 
            opacity: 0,
            y: 15,
            scale: 0.98
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power1.out',
            force3D: true,
            willChange: 'transform, opacity',
          }
        )
      }

      // Animation de haut en bas
      if (dotsRef.current) {
        const verticalSize = (isVIP || isModerator || isChristmas || isHalloween || isEaster) ? 40 : 40
        gsap.to(dotsRef.current, {
          backgroundPosition: `0 ${verticalSize}px`,
          duration: 3,
          ease: 'none',
          repeat: -1,
        })
      }
    },
    { scope: frameRef }
  )

  return (
    <div
      ref={frameRef}
      className="flex items-start gap-2 bg-white border-4 border-white w-full overflow-hidden select-none rounded-3xl relative"
      style={{
        boxShadow: `inset 0 0 20px 0 ${boxShadow}`,
        padding: '1rem',
        paddingTop: '1.25rem',
      }}
    >
      {/* Pattern animé en arrière-plan : diamant pour VIP, épée pour modérateur, sinon points, flocons de neige, citrouilles ou œufs de Pâques avec la couleur du thème */}
      <div
        ref={dotsRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isVIP
            ? `url("${diamondSVG}")`
            : isModerator
            ? `url("${swordSVG}")`
            : isChristmas 
            ? `url("${snowflakeSVG}")`
            : isHalloween
            ? `url("${pumpkinSVG}")`
            : isEaster
            ? `url("${easterEggSVG}")`
            : `radial-gradient(circle, ${themeColor} 3px, transparent 3px)`,
          backgroundSize: isVIP 
            ? diamondBackgroundSize 
            : isModerator
            ? swordBackgroundSize
            : (isChristmas || isHalloween || isEaster) 
            ? snowflakeBackgroundSize 
            : '40px 40px',
          backgroundPosition: '0 0',
          opacity: 0.20,
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 100%)',
        }}
      />
      <span className="flex-1 break-words relative z-10" style={{ 
        fontSize: `${fontSize}px`, 
        color: textColor,
        fontWeight: 'bold',
        fontFamily: "'Figtree Bold', sans-serif",
      }}>
        {children}
      </span>
    </div>
  )
}

// Composant pour gérer la disparition des messages avec animation d'écrasement
function MessageItem({ message, messageTimeout, onRemove, children }: MessageItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialiser la hauteur au montage
  useGSAP(() => {
    if (itemRef.current) {
      // Définir la hauteur automatique initiale
      gsap.set(itemRef.current, { height: 'auto' })
    }
  }, { scope: itemRef })

  useEffect(() => {
    if (!messageTimeout || !itemRef.current) return

    const animateRemoval = () => {
      if (!itemRef.current) return

      // Obtenir la hauteur actuelle avant l'animation
      const currentHeight = itemRef.current.offsetHeight
      
      // Définir la hauteur explicite pour l'animation
      gsap.set(itemRef.current, { height: currentHeight })

      // Animer l'écrasement en hauteur
      gsap.to(itemRef.current, {
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          onRemove(message.id)
        }
      })
    }

    const startTime = message.timestamp.getTime()
    const now = Date.now()
    const elapsed = now - startTime
    const remaining = messageTimeout - elapsed

    if (remaining <= 0) {
      // Le message a déjà dépassé le timeout, l'animer immédiatement
      animateRemoval()
    } else {
      // Programmer l'animation pour le moment où le timeout sera atteint
      timeoutRef.current = setTimeout(() => {
        animateRemoval()
      }, remaining)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [message, messageTimeout, onRemove])

  return (
    <div ref={itemRef} className="relative max-w-lg w-full mx-auto">

      {children}
    </div>
  )
}

export default function MessageList({
  messages,
  messagesEndRef,
  borderWidth,
  fontSize,
  offsetLeft,
  themeColor = '#2596be',
  selectedTheme = 'default',
  spaceBetween = 64,
  paddingTop = 64,
  messageTimeout = null,
}: MessageListProps) {
  const [removedMessageIds, setRemovedMessageIds] = useState<Set<string>>(new Set())
  const [customNamesMap, setCustomNamesMap] = useState<Map<string, string>>(new Map())
  const [crownMap, setCrownMap] = useState<Map<string, boolean>>(new Map())

  const handleRemoveMessage = useCallback((id: string) => {
    setRemovedMessageIds(prev => new Set(prev).add(id))
  }, [])

  // Charger les données depuis Google Sheets
  useEffect(() => {
    const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR9JvSkVw7adKYRa2SCwYhFr7iVjSgtN3Oin4TLXQ-tWPpJsvXxcLLvXA30L5jriOCJNWz5q4zq0sFH/pub?gid=0&single=true&output=csv'
    fetch(googleSheetsUrl)
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n').filter(line => line.trim())
        const map = new Map<string, string>()
        const crown = new Map<string, boolean>()

        // Parser le CSV (format: pseudonyme,rename,showCrown)
        for (let i = 0; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          if (values.length >= 1 && values[0]) {
            const pseudonyme = values[0]
            const rename = values[1] || ''
            const showCrown = values[2] === '1' || values[2]?.toLowerCase() === 'true'
            // Si rename existe, l'utiliser, sinon garder le pseudonyme
            map.set(pseudonyme.toLowerCase(), rename || pseudonyme)
            crown.set(pseudonyme.toLowerCase(), showCrown)
          }
        }

        setCustomNamesMap(map)
        setCrownMap(crown)
      })
      .catch(error => {
        console.error('Erreur lors du chargement du Google Sheets:', error)
      })
  }, [])

  // Fonction pour obtenir le nom à afficher (rename ou pseudonyme original)
  const getDisplayName = (username: string): string => {
    const lowerUsername = username.toLowerCase()
    return customNamesMap.get(lowerUsername) || username
  }

  // Filtrer les messages supprimés
  const visibleMessages = messages.filter(msg => !removedMessageIds.has(msg.id))
  
  // Charger les thèmes pour déterminer le thème actuel
  const [themes, setThemes] = useState<any[]>([])
  const [currentThemeName, setCurrentThemeName] = useState<string>('default')
  
  useEffect(() => {
    fetch(getPath('/data/themes.json'))
      .then(response => response.json())
      .then(data => {
        const themesList = data.themes || []
        setThemes(themesList)
        
        // Déterminer le thème actuel en fonction de la date
        const now = new Date()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const year = now.getFullYear()
        
        let themeName = 'default'
        
        // Parcourir tous les thèmes (sauf default) pour trouver une correspondance
        for (const theme of themesList) {
          if (theme.name === 'default') continue
          
          for (const period of theme.periods || []) {
            if (period.type === 'easter') {
              // Période relative à Pâques
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
              const easterMonth = Math.floor((h + l - 7 * m + 114) / 31) - 1
              const easterDay = ((h + l - 7 * m + 114) % 31) + 1
              const easterDate = new Date(year, easterMonth, easterDay)
              const nowTime = now.getTime()
              const easterTime = easterDate.getTime()
              const daysDiff = Math.floor((nowTime - easterTime) / (1000 * 60 * 60 * 24))
              const daysBefore = period.daysBefore || 14
              const daysAfter = period.daysAfter || 14
              
              if (daysDiff >= -daysBefore && daysDiff <= daysAfter) {
                themeName = theme.name
                break
              }
            } else if (period.startMonth && period.startDay && period.endMonth && period.endDay) {
              // Période fixe
              const startDate = new Date(year, period.startMonth - 1, period.startDay)
              const endDate = new Date(year, period.endMonth - 1, period.endDay)
              const currentDate = new Date(year, month - 1, day)
              
              // Gérer le cas où la période traverse l'année
              if (endDate < startDate) {
                if (currentDate >= startDate || currentDate <= endDate) {
                  themeName = theme.name
                  break
                }
              } else {
                if (currentDate >= startDate && currentDate <= endDate) {
                  themeName = theme.name
                  break
                }
              }
            }
          }
          if (themeName !== 'default') break
        }
        
        setCurrentThemeName(themeName)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des thèmes:', error)
      })
  }, [])
  
  // Vérifier si c'est Noël selon le thème actuel
  const isChristmas = (): boolean => {
    return currentThemeName === 'noel'
  }

  // Vérifier si c'est Halloween selon le thème actuel
  const isHalloween = (): boolean => {
    return currentThemeName === 'halloween'
  }

  // Vérifier si c'est Pâques selon le thème actuel
  const isEaster = (): boolean => {
    return currentThemeName === 'paques'
  }

  // Normaliser la couleur hex (ajouter # si absent)
  const normalizeHex = (hex: string): string => {
    return hex.startsWith('#') ? hex : `#${hex}`
  }

  // Convertir une couleur hex en rgba
  const hexToRgba = (hex: string, alpha: number = 0.3): string => {
    const normalized = normalizeHex(hex)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Calculer la luminosité d'une couleur (0-255)
  const getLuminance = (hex: string): number => {
    const normalized = normalizeHex(hex)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    // Formule de luminosité relative (perçue par l'œil humain)
    return (0.299 * r + 0.587 * g + 0.114 * b)
  }

  // Obtenir la couleur du texte en fonction des badges/rôles
  const getTextColor = (badges?: Record<string, string>): string => {
    // Lead Modérateur : #91277e (prioritaire)
    if (badges?.lead_moderator) {
      return '#912755'
    }
    // Modérateur : #3c9127
    if (badges?.moderator) {
      return '#3c9127'
    }
    // VIP : rgb(102, 9, 114)
    if (badges?.vip) {
      return 'rgb(140, 12, 151)'
    }
    // Par défaut : version sombre de la couleur de thème
    const normalized = normalizeHex(themeColor)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    // Assombrir la couleur en multipliant par 0.3 (ajuste ce facteur pour plus ou moins sombre)
    const darkR = Math.round(r * 0.3)
    const darkG = Math.round(g * 0.3)
    const darkB = Math.round(b * 0.3)
    return `rgb(${darkR}, ${darkG}, ${darkB})`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBadgeEmoji = (badges: Record<string, string>) => {
    if (badges.broadcaster) return '👑'
    if (badges.moderator) return '🛡️'
    if (badges.vip) return '⭐'
    if (badges.subscriber) return '💜'
    if (badges.premium) return '✨'
    return null
  }

  // Capitaliser la première lettre du premier mot
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  // Obtenir une version plus claire de la couleur du texte
  const getLighterTextColor = (): string => {
    const normalized = normalizeHex(themeColor)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    // Éclaircir la couleur en multipliant par 0.6
    const lightR = Math.round(r * 0.6)
    const lightG = Math.round(g * 0.6)
    const lightB = Math.round(b * 0.6)
    return `rgb(${lightR}, ${lightG}, ${lightB})`
  }

  // Parser les mentions (@username) dans un texte
  const parseMentions = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = []
    const mentionRegex = /@(\w+)/g
    let lastIndex = 0
    let match
    let keyIndex = 0

    while ((match = mentionRegex.exec(text)) !== null) {
      // Ajouter le texte avant la mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Extraire le pseudo sans le @ et utiliser le rename si disponible
      const username = match[1] // match[1] contient le pseudo sans le @
      const displayName = getDisplayName(username)
      const capitalizedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
      const lighterColor = getLighterTextColor()
      parts.push(
        <span
          key={`mention-${keyIndex++}`}
          style={{
            fontStyle: 'italic',
            color: lighterColor,
          }}
        >
          {capitalizedDisplayName}
        </span>
      )

      lastIndex = match.index + match[0].length // match[0] contient @username complet
    }

    // Ajouter le texte restant
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : [text]
  }

  // Parser les emotes et créer un message avec images
  const parseMessageWithEmotes = (message: string, emotes?: string | Record<string, string[]>, emoteFontSize: number = fontSize) => {
    // D'abord parser les mentions dans le texte
    const parseTextWithMentions = (text: string): (string | JSX.Element)[] => {
      return parseMentions(text)
    }

    if (!emotes) {
      const parts = parseTextWithMentions(message)
      return <span>{parts}</span>
    }

    const emotePositions: EmotePosition[] = []

    // Gérer le format objet : { "25": ["0-4"], "305954156": ["6-15"] }
    if (typeof emotes === 'object' && !Array.isArray(emotes)) {
      Object.entries(emotes).forEach(([emoteId, positions]) => {
        positions.forEach((pos) => {
          const [start, end] = pos.split('-').map(Number)
          emotePositions.push({ emoteId, start, end })
        })
      })
    }
    // Gérer le format chaîne : "emoteId:start-end,start-end/emoteId2:start-end"
    else if (typeof emotes === 'string') {
      const emoteParts = emotes.split('/')
      emoteParts.forEach((part) => {
        const [emoteId, positions] = part.split(':')
        if (positions) {
          positions.split(',').forEach((pos) => {
            const [start, end] = pos.split('-').map(Number)
            emotePositions.push({ emoteId, start, end })
          })
        }
      })
    }

    // Trier par position de début
    emotePositions.sort((a, b) => a.start - b.start)

    // Si aucune emote trouvée, retourner le message tel quel
    if (emotePositions.length === 0) {
      return <span>{message}</span>
    }

    // Construire le message avec les emotes
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0

    emotePositions.forEach(({ emoteId, start, end }) => {
      // Ajouter le texte avant l'emote (avec parsing des mentions)
      if (start > lastIndex) {
        const textBefore = message.substring(lastIndex, start)
        if (textBefore) {
          const mentionParts = parseTextWithMentions(textBefore)
          parts.push(...mentionParts)
        }
      }

      // Ajouter l'image de l'emote (v4 - haute résolution)
      const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/4.0`
      parts.push(
        <img
          key={`${emoteId}-${start}-${end}`}
          src={emoteUrl}
          alt={`emote-${emoteId}`}
          className="inline-block align-middle w-auto mx-0.5"
          style={{ 
            height: `${emoteFontSize * 1.5}px`,
            borderRadius: '4px'
          }}
          loading="lazy"
        />
      )

      lastIndex = end + 1
    })

    // Ajouter le texte restant après la dernière emote (avec parsing des mentions)
    if (lastIndex < message.length) {
      const textAfter = message.substring(lastIndex)
      if (textAfter) {
        const mentionParts = parseTextWithMentions(textAfter)
        parts.push(...mentionParts)
      }
    }

    return <span>{parts}</span>
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div 
        style={{
          maxWidth: borderWidth ? `${borderWidth}px` : '100%',
          width: '100%',
          marginLeft: `${offsetLeft}px`,
          paddingTop: `${paddingTop}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${spaceBetween}px`,
        }}
      >
        {visibleMessages.map((msg) => {
          return (
            <MessageItem
              key={msg.id}
              message={msg}
              messageTimeout={messageTimeout}
              onRemove={handleRemoveMessage}
            >
              {/* Cadre du pseudo en haut au centre */}
              <div
                className="bg-white border-4 border-white overflow-hidden select-none rounded-3xl"
                style={{
                  boxShadow: `inset 0 0 10px 0 ${hexToRgba(themeColor, 0.3)}`,
                  padding: '0.25rem 1rem',
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                  zIndex: 10,
                }}
              >
                <SplitText
                  text={getDisplayName(msg.username)}
                  tag="span"
                  className=""
                  delay={30}
                  duration={0.8}
                  ease="power1.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 15, scale: 0.9 }}
                  to={{ opacity: 1, y: 0, scale: 1 }}
                  immediate={true}
                  style={{
                    fontSize: `${fontSize}px`,
                    color: getTextColor(msg.badges),
                    fontWeight: 'bold',
                    fontFamily: "'Oliver Regular', sans-serif",
                    paddingTop: '0.3rem',
                    display: 'inline-block',
                  }}
                />
              </div>
              {/* Cadre de la couronne à droite si activé */}
              {crownMap.get(msg.username.toLowerCase()) && (
                <>
                  {(() => {
                    // Afficher le rôle de la personne dans la console avec le pseudo en rouge vif
                    const roles = []
                    if (msg.badges?.broadcaster) roles.push('Broadcaster')
                    if (msg.badges?.moderator) roles.push('Moderator')
                    if (msg.badges?.vip) roles.push('VIP')
                    if (msg.badges?.subscriber) roles.push('Subscriber')
                    if (msg.badges?.premium) roles.push('Premium')
                    if (msg.badges?.lead_moderator) roles.push('Lead Moderator')
                    
                    const roleText = roles.length > 0 ? roles.join(', ') : 'Aucun rôle'
                    const roleCount = roles.length
                    
                    // Afficher le pseudo en rouge vif et le rôle avec le compte
                    console.log(
                      `%c👤 ${msg.username}%c - Rôles (${roleCount}): ${roleText}`,
                      'color: #ff0000; font-weight: bold; font-size: 14px;',
                      'color: inherit;',
                      msg.badges
                    )
                    return null
                  })()}
                  <CrownFrame
                    themeColor={themeColor}
                    fontSize={fontSize}
                    hexToRgba={hexToRgba}
                  />
                </>
              )}
              {/* Cadre du message */}
              <MessageFrame
                boxShadow={hexToRgba(themeColor, 0.3)}
                fontSize={fontSize}
                textColor={getTextColor()}
                isChristmas={isChristmas()}
                isHalloween={isHalloween()}
                isEaster={isEaster()}
                themeColor={themeColor}
                isVIP={!!msg.badges?.vip}
                isModerator={!!msg.badges?.moderator}
              >
                {parseMessageWithEmotes(capitalizeFirstLetter(msg.message), msg.emotes)}
              </MessageFrame>
            </MessageItem>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

