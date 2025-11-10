'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const [description, setDescription] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !subdomain || !formUrl) {
      alert('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          subdomain,
          formUrl,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Guardar en localStorage temporalmente (MVP)
        localStorage.setItem(`landing_${subdomain}`, JSON.stringify(data.data))
        router.push(`/edit/${subdomain}`)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error al crear la landing page')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Crea tu Landing Page</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe tu negocio o producto
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ej: Vendo perros de raza pequeña, especializados en chihuahuas y poodles..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de tu landing (será tu URL)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ventadeperros"
              />
              <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                .landingyou.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del formulario (donde quieres que vayan los clientes)
            </label>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://forms.google.com/..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generando...' : 'Generar Landing Page'}
          </button>
        </form>
      </div>
    </div>
  )
}

