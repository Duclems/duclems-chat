'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getThemeColor, THEME_COLORS } from '@/config'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface AnnouncementData {
  question: string
  startTime: string
  duration: number
  isActive: boolean
}

export default function OverlayRami() {
  const searchParams = useSearchParams()
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isVisible, setIsVisible] = useState(false)
  const [themes, setThemes] = useState<any[]>([])
  const [themesLoaded, setThemesLoaded] = useState(false)
  const [currentThemeName, setCurrentThemeName] = useState<string>('default')
  const frameRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [snowflakeSVG, setSnowflakeSVG] = useState<string>('')
  const [pumpkinSVG, setPumpkinSVG] = useState<string>('')
  const [easterEggSVG, setEasterEggSVG] = useState<string>('')

  // Récupérer le paramètre ramiWidth de l'URL (par défaut: 600px)
  const ramiWidthParam = searchParams.get('ramiWidth')
  const maxWidth = ramiWidthParam && !isNaN(parseInt(ramiWidthParam, 10)) 
    ? Math.max(200, Math.min(2000, parseInt(ramiWidthParam, 10))) // Entre 200px et 2000px
    : 600

  // Charger les thèmes depuis le fichier JSON
  useEffect(() => {
    fetch('/data/themes.json')
      .then(response => response.json())
      .then(data => {
        const themesList = data.themes || []
        setThemes(themesList)

        const now = new Date()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const year = now.getFullYear()

        let themeName = 'default'

        for (const theme of themesList) {
          if (theme.name === 'default') continue

          for (const period of theme.periods || []) {
            if (period.type === 'easter') {
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
              const daysDiff = Math.floor((now.getTime() - easterDate.getTime()) / (1000 * 60 * 60 * 24))
              const daysBefore = period.daysBefore || 14
              const daysAfter = period.daysAfter || 14

              if (daysDiff >= -daysBefore && daysDiff <= daysAfter) {
                themeName = theme.name
                break
              }
            } else if (period.startMonth && period.startDay && period.endMonth && period.endDay) {
              const startDate = new Date(year, period.startMonth - 1, period.startDay)
              const endDate = new Date(year, period.endMonth - 1, period.endDay)
              const currentDate = new Date(year, month - 1, day)

              if (endDate < startDate) {
                if (currentDate >= startDate || currentDate <= endDate) {
                  themeName = theme.name
                  break
                }
              } else if (currentDate >= startDate && currentDate <= endDate) {
                themeName = theme.name
                break
              }
            }
          }

          if (themeName !== 'default') break
        }

        setCurrentThemeName(themeName)
        setThemesLoaded(true)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des thèmes (rami):', error)
        setThemesLoaded(true)
      })
  }, [])

  const themeColor = themesLoaded ? getThemeColor(themes) : THEME_COLORS.default

  const isChristmas = (): boolean => currentThemeName === 'noel'
  const isHalloween = (): boolean => currentThemeName === 'halloween'
  const isEaster = (): boolean => currentThemeName === 'paques'

  const normalizeColorForSVG = (color: string): string => {
    return color.startsWith('#') ? color : `#${color}`
  }

  useEffect(() => {
    if (!themesLoaded) return

    const colorForSVG = normalizeColorForSVG(themeColor)

    if (isChristmas()) {
      fetch('/images/icones/snowflake-bold-svgrepo-com.svg')
        .then(response => response.text())
        .then(svgContent => {
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 256 256"/g, 'viewBox="0 0 400 400"')
          setSnowflakeSVG(`data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG flocon (rami):', error)
        })
    } else {
      setSnowflakeSVG('')
    }

    if (isHalloween()) {
      fetch('/images/icones/pumkin-svgrepo-com.svg')
        .then(response => response.text())
        .then(svgContent => {
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 297.002 297.002"/g, 'viewBox="0 0 550 550"')
          setPumpkinSVG(`data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG citrouille (rami):', error)
        })
    } else {
      setPumpkinSVG('')
    }

    if (isEaster()) {
      fetch('/images/icones/easter-egg-3-svgrepo-com.svg')
        .then(response => response.text())
        .then(svgContent => {
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 24 24"/g, 'viewBox="0 0 40 40"')
          setEasterEggSVG(`data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG œuf (rami):', error)
        })
    } else {
      setEasterEggSVG('')
    }
  }, [themesLoaded, themeColor, currentThemeName])

  const normalizeHex = (hex: string): string => (hex.startsWith('#') ? hex : `#${hex}`)

  const hexToRgba = (hex: string, alpha: number = 0.3): string => {
    const normalized = normalizeHex(hex)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const getTextColor = (): string => {
    const normalized = normalizeHex(themeColor)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    const darkR = Math.round(r * 0.3)
    const darkG = Math.round(g * 0.3)
    const darkB = Math.round(b * 0.3)
    return `rgb(${darkR}, ${darkG}, ${darkB})`
  }

  // Mettre à jour le temps toutes les 100ms pour un timer fluide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Écouter l'événement showRami pour afficher une question
  useEffect(() => {
    const handleShowRami = (event: Event) => {
      const customEvent = event as CustomEvent<{ question: string; duration?: number }>
      const question = customEvent.detail?.question
      const duration = customEvent.detail?.duration || 600 // Durée par défaut de 10 minutes (600 secondes)
      
      if (question) {
        console.log('📢 Affichage de la question Rami:', question)
        const newAnnouncement: AnnouncementData = {
          question: question,
          startTime: new Date().toISOString(),
          duration: duration,
          isActive: true
        }
        setAnnouncement(newAnnouncement)
      }
    }

    window.addEventListener('showRami', handleShowRami)

    return () => {
      window.removeEventListener('showRami', handleShowRami)
    }
  }, [])

  // Calculer le temps restant
  const startTime = announcement ? new Date(announcement.startTime).getTime() : 0
  const elapsed = announcement ? Math.floor((currentTime - startTime) / 1000) : 0
  const totalDuration = announcement?.duration ?? 0
  const timeRemaining = Math.max(0, totalDuration - elapsed)
  const progressPercentage = totalDuration > 0 
    ? Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
    : 0
  
  // L'overlay est visible si l'annonce est active ET le temps n'est pas écoulé
  const shouldBeVisible = (announcement?.isActive ?? false) && timeRemaining > 0

  // Gérer la visibilité et l'animation de disparition
  useEffect(() => {
    if (shouldBeVisible && !isVisible) {
      // Afficher l'overlay
      setIsVisible(true)
    } else if (!shouldBeVisible && isVisible && frameRef.current) {
      // Animer la disparition
      gsap.to(frameRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.9,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          setIsVisible(false)
          setAnnouncement(null)
        },
      })
    } else if (!shouldBeVisible && !isVisible && announcement) {
      // Nettoyer si pas d'animation nécessaire
      setAnnouncement(null)
    }
  }, [shouldBeVisible, isVisible, announcement])

  useGSAP(
    () => {
      if (isVisible && frameRef.current) {
        gsap.fromTo(
          frameRef.current,
          {
            opacity: 0,
            y: -50,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power1.out',
            force3D: true,
            willChange: 'transform, opacity',
          }
        )
      }

      if (dotsRef.current && isVisible) {
        gsap.to(dotsRef.current, {
          backgroundPosition: `0 40px`,
          duration: 3,
          ease: 'none',
          repeat: -1,
        })
      }

      // Animation de rotation pour l'image
      if (imageRef.current && isVisible) {
        gsap.to(imageRef.current, {
          rotation: -20,
          duration: 1,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        })
      }
    },
    { scope: frameRef, dependencies: [isVisible] }
  )

  if (!isVisible || !announcement) {
    return null
  }

  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
      style={{ padding: '20px' }}
    >
      <div
        ref={frameRef}
        className="bg-white border-4 border-white overflow-hidden select-none rounded-3xl relative"
        style={{
          boxShadow: `inset 0 0 20px 0 ${hexToRgba(themeColor, 0.3)}`,
          padding: '1rem 1.5rem',
          minWidth: '200px',
          maxWidth: `${maxWidth}px`,
        }}
      >
        <div
          ref={dotsRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isChristmas()
              ? `url("${snowflakeSVG}")`
              : isHalloween()
              ? `url("${pumpkinSVG}")`
              : isEaster()
              ? `url("${easterEggSVG}")`
              : `radial-gradient(circle, ${themeColor} 3px, transparent 3px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0.2,
            pointerEvents: 'none',
            zIndex: 0,
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 100%)',
          }}
        />

        <div className="relative z-10 flex flex-col gap-2">
          {announcement && (
            <>
              <div className="flex items-center gap-4">
                {/* Image d'annonce à gauche */}
                <div className="flex-shrink-0">
                  <img 
                    ref={imageRef}
                    src="/images/annonce.png" 
                    alt="Annonce" 
                    className="w-12 h-12"
                  />
                </div>
                
                {/* Texte de la question */}
                <div
                  style={{
                    fontSize: '24px',
                    color: getTextColor(),
                    fontWeight: 600,
                    fontFamily: "'Figtree Bold', sans-serif",
                    textAlign: 'left',
                    wordWrap: 'break-word',
                    flex: 1,
                  }}
                >
                  {announcement.question}
                </div>
              </div>
              
              {/* Barre de progression du temps */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: hexToRgba(themeColor, 0.2),
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: `0 2px 8px 0 ${hexToRgba(themeColor, 0.3)}`,
                }}
              >
                <div
                  style={{
                    width: `${progressPercentage}%`,
                    height: '100%',
                    backgroundColor: themeColor,
                    transition: 'width 0.1s linear',
                    borderRadius: '4px',
                    boxShadow: `0 0 4px 0 ${hexToRgba(themeColor, 0.5)}`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

