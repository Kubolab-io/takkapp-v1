import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            LandingYou
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Crea landing pages profesionales con inteligencia artificial
          </p>
          <Link
            href="/create"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Crear Landing Page Gratis
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">🤖 Generación con IA</h3>
            <p className="text-gray-600">
              Describe tu negocio y la IA crea tu landing page automáticamente
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">✏️ Edición con Chat</h3>
            <p className="text-gray-600">
              Edita textos fácilmente pidiéndoselo al chat, como si hablaras con un asistente
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">🔗 URL Personalizada</h3>
            <p className="text-gray-600">
              Obtén tu URL gratis: tunegocio.landingyou.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


