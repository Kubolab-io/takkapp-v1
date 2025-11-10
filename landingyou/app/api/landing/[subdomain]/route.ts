import { NextRequest, NextResponse } from 'next/server'

// TODO: Conectar con base de datos real
// Por ahora usamos datos de ejemplo en memoria
const landingPages: Record<string, any> = {}

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const { subdomain } = params

  // TODO: Cargar de base de datos
  const landingData = landingPages[subdomain]

  if (!landingData) {
    return NextResponse.json(
      { error: 'Landing page no encontrada' },
      { status: 404 }
    )
  }

  return NextResponse.json(landingData)
}


