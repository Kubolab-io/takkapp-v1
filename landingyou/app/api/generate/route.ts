import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { description, subdomain, formUrl } = await request.json()

    if (!description || !subdomain || !formUrl) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Generar contenido con OpenAI
    const prompt = `Crea el contenido para una landing page basado en esta descripción: "${description}"

Genera un JSON con la siguiente estructura:
{
  "hero": {
    "title": "Título principal atractivo",
    "subtitle": "Subtítulo que explique el valor"
  },
  "cta": {
    "text": "Texto del botón principal"
  },
  "features": [
    {
      "title": "Característica 1",
      "description": "Descripción breve"
    },
    {
      "title": "Característica 2",
      "description": "Descripción breve"
    },
    {
      "title": "Característica 3",
      "description": "Descripción breve"
    }
  ],
  "featuresTitle": "Título de la sección de características",
  "about": "Descripción detallada del negocio o producto",
  "aboutTitle": "Sobre Nosotros",
  "finalCta": {
    "title": "Título del CTA final",
    "subtitle": "Subtítulo",
    "buttonText": "Texto del botón"
  }
}

Responde SOLO con el JSON, sin texto adicional.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en crear contenido para landing pages. Responde SOLO con JSON válido, sin markdown, sin explicaciones.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || '{}'
    let landingData

    try {
      // Limpiar el contenido si viene con markdown
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      landingData = JSON.parse(cleanedContent)
    } catch (e) {
      // Si falla, crear estructura básica
      landingData = {
        hero: {
          title: 'Bienvenido',
          subtitle: description.substring(0, 100),
        },
        cta: {
          text: 'Contáctanos',
        },
        features: [],
        about: description,
      }
    }

    // Agregar formUrl a los datos
    landingData.formUrl = formUrl
    landingData.subdomain = subdomain

    // TODO: Guardar en base de datos (Firebase o similar)
    // Por ahora solo retornamos los datos

    return NextResponse.json({
      success: true,
      data: landingData,
    })
  } catch (error: any) {
    console.error('Error generating landing page:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al generar la landing page',
      },
      { status: 500 }
    )
  }
}


