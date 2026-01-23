'use client'

import { Suspense } from 'react'
import ChatContainer from '@/components/ChatContainer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
      <Suspense fallback={<div className="h-screen" />}>
        <ChatContainer />
      </Suspense>
    </main>
  )
}
