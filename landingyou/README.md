# LandingYou - Generador de Landing Pages con IA

MVP de una plataforma para crear landing pages con inteligencia artificial. Los usuarios pueden crear landing pages con IA y editarlas mediante chat.

## Características

- 🤖 **Generación con IA**: Describe tu negocio y la IA crea tu landing page
- 💬 **Editor con Chat**: Edita textos fácilmente pidiéndoselo al chat
- 🔗 **URLs Personalizadas**: Obtén tu URL gratis (ej: tunegocio.landingyou.com)
- 📝 **Integración con Formularios**: Redirige a tu formulario personalizado

## Setup

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

3. Agregar tu OpenAI API Key en `.env.local`:
```
OPENAI_API_KEY=tu_api_key_aqui
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

- `/app` - Páginas Next.js
- `/components` - Componentes React
- `/app/api` - API Routes
- `/app/create` - Página para crear landing pages
- `/app/edit/[subdomain]` - Editor con chat
- `/app/landing/[subdomain]` - Vista pública de la landing page

## Próximos Pasos

- [ ] Integrar base de datos (Firebase)
- [ ] Sistema de autenticación
- [ ] Guardar landing pages persistentemente
- [ ] Configurar subdominios dinámicos
- [ ] Integrar MercadoPago
- [ ] Mejorar el editor con más opciones

## Notas

Este es un MVP. Actualmente las landing pages se guardan en memoria. Para producción, necesitas:
- Base de datos (Firebase Firestore recomendado)
- Sistema de autenticación
- Configuración de subdominios en tu hosting (Vercel, Cloudflare, etc.)
