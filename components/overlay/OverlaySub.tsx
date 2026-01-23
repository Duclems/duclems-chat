'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getThemeColor, THEME_COLORS } from '@/config'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import SplitText from '@/components/SplitText'

type SubEventDetail = {
  username?: string
  avatarUrl?: string
  tier?: string
  months?: number
}

const SUB_MESSAGES = [
  'Merci pour le sub pour le Duc !',
  'Duc, Dudu ? Dusub !',
  'Merci pour ce sub !',
  'Quel panache !',
  'Le Duc te remercie !',
]

const wrapMessage = (message: string, chunkSize = 28): string => {
  if (!message) return ''
  const words = message.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (word.length > chunkSize) {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = ''
      }
      lines.push(word)
      continue
    }

    if ((currentLine + (currentLine ? ' ' : '') + word).length <= chunkSize) {
      currentLine = currentLine ? `${currentLine} ${word}` : word
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.join('\n')
}

const formatMonths = (months?: number): string | null => {
  if (!months || months < 1) return null
  if (months === 1) return '1 mois de sub'
  return `${months} mois de sub`
}

const buildSubMessage = (): string => {
  const template = SUB_MESSAGES[Math.floor(Math.random() * SUB_MESSAGES.length)]
  return wrapMessage(template)
}

export default function OverlaySub() {
  const [showSub, setShowSub] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [subMessage, setSubMessage] = useState<string>(buildSubMessage())
  const [monthsLabel, setMonthsLabel] = useState<string | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const pseudoRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<number | null>(null)
  const [themes, setThemes] = useState<any[]>([])
  const [themesLoaded, setThemesLoaded] = useState(false)
  const [currentThemeName, setCurrentThemeName] = useState<string>('default')
  const [snowflakeSVG, setSnowflakeSVG] = useState<string>('')
  const [pumpkinSVG, setPumpkinSVG] = useState<string>('')
  const [easterEggSVG, setEasterEggSVG] = useState<string>('')

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
        console.error('Erreur lors du chargement des thèmes (sub):', error)
        setThemesLoaded(true)
      })
  }, [])

  const themeColor = themesLoaded ? getThemeColor(themes) : THEME_COLORS.default

  const isChristmas = () => currentThemeName === 'noel'
  const isHalloween = () => currentThemeName === 'halloween'
  const isEaster = () => currentThemeName === 'paques'

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

  useEffect(() => {
    if (!themesLoaded) return

    const colorForSVG = normalizeHex(themeColor)

    if (isChristmas()) {
      fetch('/images/icones/snowflake-bold-svgrepo-com.svg')
        .then(response => response.text())
        .then(svgContent => {
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 256 256"/g, 'viewBox="0 0 400 400"')
          setSnowflakeSVG(`data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG flocon (sub):', error)
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
          console.error('Erreur lors du chargement du SVG citrouille (sub):', error)
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
          console.error('Erreur lors du chargement du SVG œuf (sub):', error)
        })
    } else {
      setEasterEggSVG('')
    }
  }, [themesLoaded, themeColor, currentThemeName])

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const hideSubOverlay = useCallback(() => {
    clearHideTimeout()
    if (frameRef.current) {
      gsap.to(frameRef.current, {
        opacity: 0,
        x: 200,
        scale: 0.8,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          setShowSub(false)
          setUsername('')
          setAvatarUrl('')
          setMonthsLabel(null)
        },
      })
    } else {
      setShowSub(false)
      setUsername('')
      setAvatarUrl('')
      setMonthsLabel(null)
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearHideTimeout()
    hideTimeoutRef.current = window.setTimeout(() => {
      hideSubOverlay()
    }, 10000)
  }, [hideSubOverlay])

  const triggerSub = useCallback(
    (detail: SubEventDetail) => {
      if (!detail.username) return
      const message = buildSubMessage()
      const monthsText = formatMonths(detail.months)

      setUsername(detail.username)
      setAvatarUrl(detail.avatarUrl || '')
      setSubMessage(message)
      setMonthsLabel(monthsText)
      setShowSub(true)
      scheduleHide()
    },
    [scheduleHide]
  )

  useEffect(() => {
    return () => {
      clearHideTimeout()
    }
  }, [])

  useEffect(() => {
    const handleShowSub = (event: Event) => {
      const detail = (event as CustomEvent<SubEventDetail>).detail
      triggerSub(detail || {})
    }

    window.addEventListener('showSub', handleShowSub)
    return () => {
      window.removeEventListener('showSub', handleShowSub)
    }
  }, [triggerSub])

  useGSAP(
    () => {
      if (showSub && frameRef.current) {
        gsap.fromTo(
          frameRef.current,
          {
            opacity: 0,
            x: 200,
            scale: 0.85,
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power1.out',
            force3D: true,
            willChange: 'transform, opacity',
          }
        )
      }

      if (showSub && pseudoRef.current) {
        gsap.fromTo(
          pseudoRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out', delay: 0.1 }
        )
      }

      if (dotsRef.current && showSub) {
        gsap.to(dotsRef.current, {
          backgroundPosition: `0 40px`,
          duration: 3,
          ease: 'none',
          repeat: -1,
        })
      }
    },
    { scope: frameRef, dependencies: [showSub] }
  )

  if (!showSub) {
    return null
  }

  return (
    <div
      ref={frameRef}
      className="flex items-start gap-4 bg-white border-4 border-white overflow-hidden select-none rounded-3xl relative max-w-2xl"
        style={{
          boxShadow: `inset 0 0 20px 0 ${hexToRgba(themeColor, 0.3)}`,
          padding: '1rem',
          paddingTop: '1.25rem',
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

        {avatarUrl && (
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={username}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
        )}

        <div ref={pseudoRef} className="flex flex-col min-w-0" style={{ maxWidth: '420px' }}>
          <SplitText
            text={username}
            tag="span"
            className=""
            delay={30}
            duration={0.8}
            ease="power1.out"
            splitType="chars"
            from={{ opacity: 0, y: 15, scale: 0.9 }}
            to={{ opacity: 1, y: 0, scale: 1 }}
            immediate={true}
            textAlign="left"
            style={{
              fontSize: '32px',
              color: getTextColor(),
              fontWeight: 'bold',
              fontFamily: "'Oliver Regular', sans-serif",
              lineHeight: '1.2',
              display: 'inline-block',
            }}
          />
          {monthsLabel && (
            <span
              className="mt-2 text-sm font-semibold"
              style={{
                color: getTextColor(),
                fontFamily: "'Figtree Bold', sans-serif",
              }}
            >
              {monthsLabel}
            </span>
          )}
          <span
            style={{
              marginTop: '0.35rem',
              fontSize: '18px',
              color: themeColor,
              fontWeight: 600,
              fontFamily: "'Figtree Bold', sans-serif",
              whiteSpace: 'pre-wrap',
            }}
          >
            {subMessage}
          </span>
        </div>
      </div>
  )
}

