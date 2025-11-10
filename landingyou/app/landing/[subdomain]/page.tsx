'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LandingPreview from '@/components/LandingPreview'

export default function PublicLandingPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [landingData, setLandingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/landing/${subdomain}`)
      .then(res => res.json())
      .then(data => {
        setLandingData(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
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

  return <LandingPreview data={landingData} />
}


