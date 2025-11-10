import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { subdomain, message, currentData } = await request.json()

    if (!message || !currentData) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Usar OpenAI para interpretar el mensaje y modificar los datos
    const prompt = `El usuario quiere editar su landing page. Mensaje del usuario: "${message}"

Datos actuales de la landing page (JSON):
${JSON.stringify(currentData, null, 2)}

Interpreta qué cambios quiere hacer el usuario y devuelve el JSON actualizado. Por ejemplo:
- Si dice "cambia el título a X", modifica hero.title
- Si dice "modifica la descripción", cambia about
- Si dice "cambia el texto del botón a Y", modifica cta.text
- Si dice "elimina la sección de características", elimina features o ponlo como array vacío

Responde SOLO con el JSON actualizado, sin explicaciones, sin markdown.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que ayuda a editar landing pages. Responde SOLO con JSON válido, sin markdown, sin explicaciones. Mantén la estructura del JSON original y solo modifica lo que el usuario solicita.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content || '{}'
    let updatedData

    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      updatedData = JSON.parse(cleanedContent)
      
      // Asegurar que formUrl y subdomain se mantengan
      updatedData.formUrl = currentData.formUrl
      updatedData.subdomain = currentData.subdomain || subdomain
    } catch (e) {
      // Si falla el parsing, mantener los datos originales
      updatedData = currentData
    }

    // TODO: Guardar en base de datos
    // Por ahora solo retornamos los datos actualizados

    return NextResponse.json({
      success: true,
      updatedData,
      message: 'Cambios aplicados correctamente',
    })
  } catch (error: any) {
    console.error('Error editing landing page:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al editar la landing page',
      },
      { status: 500 }
    )
  }
}


