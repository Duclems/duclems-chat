'use client'

import { useState, useEffect, useRef } from 'react'
import { getThemeColor, THEME_COLORS } from '@/config'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const TIMER_DURATION = 30 * 60 // 2 minutes en secondes

export default function OverlayPolitesse() {
  const [isVisible, setIsVisible] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION)
  const [themes, setThemes] = useState<any[]>([])
  const [themesLoaded, setThemesLoaded] = useState(false)
  const [currentThemeName, setCurrentThemeName] = useState<string>('default')
  const frameRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  const [snowflakeSVG, setSnowflakeSVG] = useState<string>('')
  const [pumpkinSVG, setPumpkinSVG] = useState<string>('')
  const [easterEggSVG, setEasterEggSVG] = useState<string>('')

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
        console.error('Erreur lors du chargement des thèmes (politesse):', error)
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
          console.error('Erreur lors du chargement du SVG flocon (politesse):', error)
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
          console.error('Erreur lors du chargement du SVG citrouille (politesse):', error)
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
          console.error('Erreur lors du chargement du SVG œuf (politesse):', error)
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = (): string => {
    // Ratio de progression : 0 = début (sombre), 1 = fin (themeColor)
    const progress = 1 - (timeRemaining / TIMER_DURATION)
    
    // Couleur sombre au début (version très assombrie de themeColor)
    const normalized = normalizeHex(themeColor)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    
    // Couleur sombre : 20% de la couleur originale
    const darkR = Math.round(r * 0.2)
    const darkG = Math.round(g * 0.2)
    const darkB = Math.round(b * 0.2)
    
    // Interpolation entre la couleur sombre et la couleur du thème
    const currentR = Math.round(darkR + (r - darkR) * progress)
    const currentG = Math.round(darkG + (g - darkG) * progress)
    const currentB = Math.round(darkB + (b - darkB) * progress)
    
    return `rgb(${currentR}, ${currentG}, ${currentB})`
  }

  // Gérer le timer
  useEffect(() => {
    if (!isVisible) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    // Réinitialiser le timer quand l'overlay devient visible
    setTimeRemaining(TIMER_DURATION)

    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          // Animation de disparition avant de masquer
          if (frameRef.current) {
            gsap.to(frameRef.current, {
              opacity: 0,
              y: -30,
              scale: 0.9,
              duration: 0.5,
              ease: 'power2.in',
              onComplete: () => {
                setIsVisible(false)
              },
            })
          } else {
            setIsVisible(false)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isVisible])

  // Écouter l'événement pour afficher l'overlay
  useEffect(() => {
    const handleShowPolitesse = () => {
      setIsVisible(true)
      setTimeRemaining(TIMER_DURATION)
    }

    window.addEventListener('showPolitesse', handleShowPolitesse)
    return () => {
      window.removeEventListener('showPolitesse', handleShowPolitesse)
    }
  }, [])

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
    },
    { scope: frameRef, dependencies: [isVisible] }
  )

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed top-4 right-4 pointer-events-none z-50"
      style={{ padding: '20px' }}
    >
      <div
        ref={frameRef}
        className="bg-white border-4 border-white overflow-hidden select-none rounded-3xl relative"
        style={{
          boxShadow: `inset 0 0 20px 0 ${hexToRgba(themeColor, 0.3)}`,
          padding: '0.5rem 0.75rem',
          minWidth: '120px',
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

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            style={{
              fontSize: '32px',
              color: getTimerColor(),
              fontWeight: 'bold',
              fontFamily: "'Oliver Regular', sans-serif",
              textAlign: 'left',
              letterSpacing: '2px',
              transition: 'color 0.3s ease',
              width: '80px',
              display: 'inline-block',
            }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
    </div>
  )
}

