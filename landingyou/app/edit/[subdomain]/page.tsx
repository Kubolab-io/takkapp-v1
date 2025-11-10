'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ChatEditor from '@/components/ChatEditor'
import LandingPreview from '@/components/LandingPreview'

export default function EditPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [landingData, setLandingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar datos de la landing page (MVP: desde localStorage)
    const saved = localStorage.getItem(`landing_${subdomain}`)
    if (saved) {
      try {
        setLandingData(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing saved data', e)
      }
    }
    setLoading(false)
  }, [subdomain])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!landingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Landing page no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Editor con Chat */}
        <div className="bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Editor</h2>
            <p className="text-sm text-gray-500">
              Edita tu landing page con el chat
            </p>
          </div>
          <ChatEditor
            subdomain={subdomain}
            landingData={landingData}
            onUpdate={setLandingData}
          />
        </div>

        {/* Preview */}
        <div className="bg-gray-50 overflow-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold">Vista Previa</h2>
            <p className="text-sm text-gray-500">
              {subdomain}.landingyou.com
            </p>
          </div>
          <LandingPreview data={landingData} />
        </div>
      </div>
    </div>
  )
}

