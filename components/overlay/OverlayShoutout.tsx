'use client'

import { useState, useEffect, useRef } from 'react'
import { TWITCH_CHANNEL, getThemeColor, THEME_COLORS } from '@/config'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import SplitText from '@/components/SplitText'
import { getPath } from '@/utils/path'

const TWITCH_CLIENT_ID = 'uiuvz5c2cwt1vwcgzb8k6pcw3gv88v'

export default function OverlayShoutout() {
  const [isDebug, setIsDebug] = useState(false)
  
  useEffect(() => {
    // Vérifier si le paramètre debug est présent dans l'URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setIsDebug(urlParams.get('debug') !== null)
    }
  }, [])
  
  const [showCoucou, setShowCoucou] = useState(false)
  const [pseudonyme, setPseudonyme] = useState<string>('')
  const [profileImageUrl, setProfileImageUrl] = useState<string>('')
  const [followersCount, setFollowersCount] = useState<string>('')
  const [channelDescription, setChannelDescription] = useState<string>('')
  const [isLive, setIsLive] = useState<boolean>(false)
  const [broadcasterType, setBroadcasterType] = useState<string>('')
  const clientRef = useRef<any>(null)
  const isConnectingRef = useRef<boolean>(false)
  const [themes, setThemes] = useState<any[]>([])
  const [themesLoaded, setThemesLoaded] = useState(false)
  const [currentThemeName, setCurrentThemeName] = useState<string>('default')
  const frameRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const pseudoRef = useRef<HTMLDivElement>(null)
  const liveBadgeRef = useRef<HTMLSpanElement>(null)
  const followersRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLSpanElement>(null)
  const affiliateBadgeRef = useRef<HTMLDivElement>(null)
  const [snowflakeSVG, setSnowflakeSVG] = useState<string>('')
  const [pumpkinSVG, setPumpkinSVG] = useState<string>('')
  const [easterEggSVG, setEasterEggSVG] = useState<string>('')
  
  // Charger les thèmes depuis le fichier JSON
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
        setThemesLoaded(true)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des thèmes:', error)
        setThemesLoaded(true)
      })
  }, [])
  
  // Obtenir la couleur de thème selon la date actuelle et les thèmes configurés
  const themeColor = themesLoaded ? getThemeColor(themes) : THEME_COLORS.default

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

  // Normaliser la couleur hex pour le SVG
  const normalizeColorForSVG = (color: string): string => {
    return color.startsWith('#') ? color : `#${color}`
  }

  // Charger les SVG selon le thème
  useEffect(() => {
    if (!themesLoaded) return
    
    const colorForSVG = normalizeColorForSVG(themeColor)
    
    if (isChristmas()) {
      fetch(getPath('/images/icones/snowflake-bold-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 256 256"/g, 'viewBox="0 0 400 400"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setSnowflakeSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG flocon:', error)
        })
    } else {
      setSnowflakeSVG('')
    }

    if (isHalloween()) {
      fetch(getPath('/images/icones/pumkin-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 297.002 297.002"/g, 'viewBox="0 0 550 550"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setPumpkinSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG citrouille:', error)
        })
    } else {
      setPumpkinSVG('')
    }

    if (isEaster()) {
      fetch(getPath('/images/icones/easter-egg-3-svgrepo-com.svg'))
        .then(response => response.text())
        .then(svgContent => {
          let modifiedSVG = svgContent.replace(/fill="#000000"/g, `fill="${colorForSVG}"`)
          modifiedSVG = modifiedSVG.replace(/viewBox="0 0 24 24"/g, 'viewBox="0 0 40 40"')
          const dataURI = `data:image/svg+xml,${encodeURIComponent(modifiedSVG)}`
          setEasterEggSVG(dataURI)
        })
        .catch(error => {
          console.error('Erreur lors du chargement du SVG œuf:', error)
        })
    } else {
      setEasterEggSVG('')
    }
  }, [themesLoaded, themeColor, currentThemeName])

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

  // Obtenir la couleur du texte (version sombre de la couleur de thème, comme dans le chat)
  const getTextColor = (): string => {
    const normalized = normalizeHex(themeColor)
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)
    // Assombrir la couleur en multipliant par 0.3 (comme dans le chat)
    const darkR = Math.round(r * 0.3)
    const darkG = Math.round(g * 0.3)
    const darkB = Math.round(b * 0.3)
    return `rgb(${darkR}, ${darkG}, ${darkB})`
  }

  // Log pour déboguer la description
  useEffect(() => {
    if (showCoucou) {
      console.log('🎬 Rendu du cadre - channelDescription:', channelDescription ? `"${channelDescription.substring(0, 50)}..."` : '(vide)', 'Longueur:', channelDescription?.length || 0)
    }
  }, [showCoucou, channelDescription])

  // Animation GSAP pour l'apparition du cadre depuis le centre-droite
  useGSAP(
    () => {
      if (showCoucou && frameRef.current) {
        // Animation du cadre principal
        gsap.fromTo(
          frameRef.current,
          { 
            opacity: 0,
            x: 200,
            y: 0,
            scale: 0.8
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power1.out',
            force3D: true,
            willChange: 'transform, opacity',
          }
        )

        // Animation séquentielle des éléments
        const tl = gsap.timeline({ delay: 0.25 })

        // 1. Image apparaît en premier (début)
        if (imageRef.current) {
          gsap.set(imageRef.current, { opacity: 0, scale: 0.8 })
          tl.to(imageRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: 'back.out(1.2)',
          })
        }

        // 2. Pseudo et followers apparaissent en même temps (après l'image)
        if (pseudoRef.current) {
          gsap.set(pseudoRef.current, { opacity: 0, y: 10 })
          tl.to(pseudoRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: 'power1.out',
          }, '-=0.3') // Commence un peu avant la fin de l'image
        }

        if (followersRef.current) {
          gsap.set(followersRef.current, { opacity: 0, y: 20 })
          tl.to(followersRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          }, '-=0.6') // En même temps que le pseudo
        }

        // Badge partenaire avec un délai de 0.25s
        if (affiliateBadgeRef.current && broadcasterType === 'partner') {
          gsap.set(affiliateBadgeRef.current, { opacity: 0, scale: 0, rotation: -180 })
          tl.to(affiliateBadgeRef.current, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: 'back.out(1.2)',
          }, 0.25) // Délai de 0.25s
        }

      }

      // Animation de haut en bas pour le pattern
      if (dotsRef.current && showCoucou) {
        gsap.to(dotsRef.current, {
          backgroundPosition: `0 40px`,
          duration: 3,
          ease: 'none',
          repeat: -1,
        })
      }
    },
    { scope: frameRef, dependencies: [showCoucou, broadcasterType] }
  )

  // Fonction pour déconnecter toutes les connexions existantes
  const disconnectAll = () => {
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners()
        clientRef.current.disconnect()
      } catch (err) {
        console.error('Erreur lors de la déconnexion:', err)
      }
      clientRef.current = null
    }
    isConnectingRef.current = false
  }

  // Connexion automatique au chargement
  useEffect(() => {
    if (TWITCH_CHANNEL) {
      disconnectAll()
      setTimeout(() => {
        connectToChat(TWITCH_CHANNEL)
      }, 100)
    }

    return () => {
      disconnectAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const connectToChat = async (channelName: string) => {
    disconnectAll()
    await new Promise(resolve => setTimeout(resolve, 200))

    if (isConnectingRef.current) {
      console.log('Une connexion est déjà en cours, annulation...')
      return
    }

    isConnectingRef.current = true

    const channelFormatted = channelName.startsWith('#')
      ? channelName
      : `#${channelName}`

    // Import dynamique de tmi.js
    const tmiModule = await import('tmi.js')
    const Client = (tmiModule as any).Client || (tmiModule as any).default?.Client || (tmiModule as any).default

    if (!Client) {
      console.error('Impossible de charger tmi.js')
      return
    }

    const client = new Client({
      options: { debug: false },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: 'justinfan12345',
        password: 'oauth:',
      },
      channels: [channelFormatted],
    })

    client.on('message', (channel: string, tags: any, message: string, self: boolean) => {
      // Vérifier si le message commence par "!so"
      const messageTrimmed = message.trim()
      const lowerMessage = messageTrimmed.toLowerCase()
      
      if (lowerMessage.startsWith('!so')) {
        // Vérifier si l'utilisateur est modérateur ou propriétaire
        const badges = tags.badges || {}
        const isModerator = badges.moderator === '1'
        const isBroadcaster = badges.broadcaster === '1'
        
        // Vérifier si l'utilisateur est le propriétaire (nom correspond au channel configuré)
        const username = (tags.username || tags['display-name'] || '').toLowerCase()
        const isOwner = username === TWITCH_CHANNEL.toLowerCase()
        
        if (isModerator || isBroadcaster || isOwner) {
          // Extraire le pseudonyme après "!so"
          const parts = messageTrimmed.split(/\s+/)
          let extractedPseudonyme = ''
          
          if (parts.length > 1) {
            // Prendre tout ce qui suit "!so" comme pseudonyme
            extractedPseudonyme = parts.slice(1).join(' ')
          }
          
          // Si pas de pseudonyme, utiliser le nom de l'utilisateur qui a envoyé la commande
          if (!extractedPseudonyme) {
            extractedPseudonyme = tags['display-name'] || tags.username || 'Anonyme'
          }
          
          // Vérifier si le pseudonyme existe sur Twitch
          checkUserExists(extractedPseudonyme)
        }
      }
    })

    client.on('connected', () => {
      console.log('Overlay Shoutout connecté au chat Twitch:', channelName)
      isConnectingRef.current = false
    })

    client.on('disconnected', (reason: string) => {
      console.log('Overlay Shoutout déconnecté du chat:', reason)
      isConnectingRef.current = false
      if (clientRef.current === client) {
        clientRef.current = null
      }
    })

    client.connect().catch((err: any) => {
      console.error('Erreur de connexion overlay:', err)
      isConnectingRef.current = false
      if (clientRef.current === client) {
        clientRef.current = null
      }
    })

    clientRef.current = client
  }

  const formatFollowersCount = (count: number): string => {
    if (count < 1000) {
      // Moins de 1000 : afficher tel quel
      return count.toString()
    } else if (count < 1000000) {
      // Entre 1000 et 999999 : afficher en k avec 2 décimales
      const k = count / 1000
      // S'assurer d'avoir toujours 3 chiffres significatifs
      if (k < 10) {
        return k.toFixed(2) + ' k'
      } else if (k < 100) {
        return k.toFixed(1) + ' k'
      } else {
        return Math.round(k).toString() + ' k'
      }
    } else {
      // 1 million et plus : afficher en m avec 2 décimales
      const m = count / 1000000
      if (m < 10) {
        return m.toFixed(2) + ' m'
      } else if (m < 100) {
        return m.toFixed(1) + ' m'
      } else {
        return Math.round(m).toString() + ' m'
      }
    }
  }

  const getFollowersCount = async (userId: string, accessToken: string): Promise<number> => {
    // Fonction désactivée car nécessite l'authentification
    return 0
  }

  const checkIfLive = async (userId: string, accessToken: string): Promise<boolean> => {
    // Fonction désactivée car nécessite l'authentification
    return false
  }

  const checkIfLiveWithAppToken = async (userId: string): Promise<boolean> => {
    // Fonction désactivée car nécessite l'authentification
    return false
  }

  const getChannelDescription = async (username: string, userId?: string): Promise<string> => {
    // Fonction désactivée car nécessite l'authentification ou des API supprimées
    return ''
  }

  const getFollowersCountWithAppToken = async (userId: string): Promise<number> => {
    // Fonction désactivée car nécessite l'authentification
    return 0
  }

  // Fonction pour déclencher un shoutout manuellement (désactivée car nécessite l'authentification)
  const triggerShoutout = async (username: string) => {
    console.log('⚠️ Shoutout manuel désactivé (nécessite l\'authentification)')
  }

  const checkUserExists = async (username: string) => {
    try {
      // Version simplifiée : afficher juste le nom d'utilisateur sans récupérer d'infos supplémentaires
      // car l'authentification n'est plus utilisée
      console.log('🎯 Shoutout pour:', username)
      
      setPseudonyme(username)
      setProfileImageUrl('')
      setChannelDescription('')
      setBroadcasterType('')
      setFollowersCount('')
      setIsLive(false)
      
      setShowCoucou(true)
      
      // Animer la disparition après 20 secondes
      setTimeout(() => {
        if (frameRef.current) {
          gsap.to(frameRef.current, {
            opacity: 0,
            x: 200,
            y: 0,
            scale: 0.8,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
              setShowCoucou(false)
              setPseudonyme('')
              setProfileImageUrl('')
              setFollowersCount('')
              setChannelDescription('')
              setIsLive(false)
              setBroadcasterType('')
            }
          })
        } else {
          setShowCoucou(false)
          setPseudonyme('')
          setProfileImageUrl('')
          setFollowersCount('')
          setChannelDescription('')
          setIsLive(false)
          setBroadcasterType('')
        }
      }, 20000)
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', err)
    }
  }

  return (
    <>
      {/* Boutons de shoutout manuel en haut à gauche - uniquement en mode debug */}
      {isDebug && (
        <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => triggerShoutout('duclems')}
          className="bg-[#9146FF] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          SO: duclems
        </button>
        <button
          onClick={() => triggerShoutout('nejda')}
          className="bg-[#9146FF] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          SO: nejda
        </button>
        <button
          onClick={() => triggerShoutout('otplol_')}
          className="bg-[#9146FF] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          SO: otplol_
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('showSub', {
                detail: {
                  username: 'NouveauSub',
                  avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_image-300x300.png',
                  tier: 'Prime',
                  months: 3,
                },
              })
            )
          }}
          className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Sub
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('showFollow', {
                detail: {
                  username: 'NewFollower',
                  avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_image-300x300.png',
                },
              })
            )
          }}
          className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Follow
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('showPolitesse'))
          }}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Politesse
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('showRami', {
                detail: { text: 'Test message Rami' },
              })
            )
          }}
          className="bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Test Rami
        </button>
        </div>
      )}
      
      {showCoucou && (
        <div
          ref={frameRef}
          className="flex items-start gap-2 bg-white border-4 border-white overflow-hidden select-none rounded-3xl relative max-w-2xl"
            style={{
              boxShadow: `inset 0 0 20px 0 ${hexToRgba(themeColor, 0.3)}`,
              padding: '1rem',
              paddingTop: '1.25rem',
            }}
          >
            {/* Pattern animé en arrière-plan : flocons pour Noël, citrouilles pour Halloween, œufs pour Pâques, sinon points */}
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
                backgroundSize: (isChristmas() || isHalloween() || isEaster()) ? '40px 40px' : '40px 40px',
                backgroundPosition: '0 0',
                opacity: 0.20,
                pointerEvents: 'none',
                zIndex: 0,
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 100%)',
              }}
            />
            <div className="flex-1 flex items-start gap-4 relative z-10">
              {/* Image à gauche */}
              {profileImageUrl && (
                <div className="relative flex-shrink-0">
                  <img 
                    ref={imageRef}
                    src={profileImageUrl} 
                    alt={pseudonyme}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  {/* Badge partenaire - juste le logo */}
                  {broadcasterType === 'partner' && (
                    <div
                      ref={affiliateBadgeRef}
                      className="absolute -bottom-3 -right-3"
                    >
                      <svg width="40" height="40" viewBox="0 0 20 20" aria-label="Verified Partner">
                        {/* Cercle blanc de fond */}
                        <circle cx="8" cy="8" r="5" fill="white"/>
                        {/* Logo de vérification violet (identique au partenaire) */}
                        <path fillRule="evenodd" d="M12.5 3.5 8 2 3.5 3.5 2 8l1.5 4.5L8 14l4.5-1.5L14 8l-1.5-4.5ZM7 11l4.5-4.5L10 5 7 8 5.5 6.5 4 8l3 3Z" clipRule="evenodd" fill="#9810fa"></path>
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              {/* Contenu à droite de l'image */}
              <div className=" flex flex-col min-w-0" style={{ maxHeight: '96px' }}>
                {/* Pseudo */}
                <div ref={pseudoRef} style={{ flexShrink: 0 }}>
                  <SplitText
                    text={pseudonyme}
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
                      fontSize: '28px',
                      color: getTextColor(),
                      fontWeight: 'bold',
                      fontFamily: "'Oliver Regular', sans-serif",
                      lineHeight: '1.2',
                      display: 'inline-block',
                    }}
                  />
                </div>
                
                {/* Nombre de followers */}
                {followersCount && (
                  <div ref={followersRef} className="flex flex-col">
                    <span className="break-words" style={{ 
                      fontSize: '24px', 
                      color: themeColor,
                      fontWeight: 'bold',
                      fontFamily: "'Figtree Bold', sans-serif",
                    }}>
                      {followersCount}
                    </span>
                    <span className="break-words" style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      fontWeight: 'normal',
                      fontFamily: "'Figtree Bold', sans-serif",
                    }}>
                      followers
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </>
  )
}

