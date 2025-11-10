'use client'

interface LandingPreviewProps {
  data: any
}

export default function LandingPreview({ data }: LandingPreviewProps) {
  if (!data) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {data.hero?.title || 'Bienvenido'}
          </h1>
          <p className="text-xl mb-8 opacity-90">
            {data.hero?.subtitle || 'Tu mensaje aquí'}
          </p>
          <a
            href={data.formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {data.cta?.text || 'Contáctanos'}
          </a>
        </div>
      </section>

      {/* Features Section */}
      {data.features && data.features.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {data.featuresTitle || 'Características'}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {data.features.map((feature: any, idx: number) => (
                <div key={idx} className="text-center p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {data.about && (
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              {data.aboutTitle || 'Sobre Nosotros'}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {data.about}
            </p>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            {data.finalCta?.title || '¿Listo para comenzar?'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {data.finalCta?.subtitle || 'Contáctanos ahora'}
          </p>
          <a
            href={data.formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {data.finalCta?.buttonText || 'Comenzar'}
          </a>
        </div>
      </section>
    </div>
  )
}


