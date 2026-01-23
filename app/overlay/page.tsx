'use client'

import { Suspense } from 'react'
import OverlayShoutout from '@/components/overlay/OverlayShoutout'
import OverlayFollow from '@/components/overlay/OverlayFollow'
import FollowWatcher from '@/components/overlay/FollowWatcher'
import OverlaySub from '@/components/overlay/OverlaySub'
import SubWatcher from '@/components/overlay/SubWatcher'
import RewardWatcher from '@/components/overlay/RewardWatcher'
import OverlayPolitesse from '@/components/overlay/OverlayPolitesse'
import OverlayRami from '@/components/overlay/OverlayRami'

export default function OverlayPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
      <RewardWatcher />
      <FollowWatcher />
      <SubWatcher />
      
      {/* Conteneur pour les overlays qui doivent s'empiler verticalement */}
      <div className="fixed inset-0 flex items-center justify-end pointer-events-none z-40" style={{ paddingRight: '20px' }}>
        <div className="flex flex-col gap-4 items-end">
          <OverlayShoutout />
          <OverlayFollow />
          <OverlaySub />
        </div>
      </div>
      
      <OverlayPolitesse />
      <Suspense fallback={null}>
        <OverlayRami />
      </Suspense>
    </main>
  )
}
