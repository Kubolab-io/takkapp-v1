'use client'

import { useState, useRef, useEffect } from 'react'

interface ChatEditorProps {
  subdomain: string
  landingData: any
  onUpdate: (data: any) => void
}

export default function ChatEditor({ subdomain, landingData, onUpdate }: ChatEditorProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          message: userMessage,
          currentData: landingData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message || 'Cambios aplicados correctamente' 
        }])
        // Guardar en localStorage (MVP)
        localStorage.setItem(`landing_${subdomain}`, JSON.stringify(data.updatedData))
        onUpdate(data.updatedData)
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Error: ' + (data.error || 'No se pudo aplicar el cambio') 
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error al procesar tu solicitud' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-2">💬 Chatea conmigo para editar tu landing page</p>
            <p className="text-sm">Ejemplos:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• "Cambia el título a 'Venta de Perros Premium'"</li>
              <li>• "Modifica la descripción del producto"</li>
              <li>• "Cambia el color del botón a rojo"</li>
            </ul>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg px-4 py-2">
              Pensando...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu solicitud..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}

