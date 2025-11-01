# Gran Dzilam Monorepo

Este monorepo contiene el frontend (Next.js) y el backend (Express) configurados con npm workspaces.

## Scripts principales

- `npm run dev`: inicia frontend y backend en paralelo.
- `npm run build`: compila todos los paquetes.
- `npm run lint`: ejecuta ESLint en los paquetes.
- `npm run format`: ejecuta Prettier en los paquetes.

Consulta los README específicos dentro de cada paquete para más detalles.

## Funcionalidad Imagine

La nueva experiencia **Imagine** permite generar un texto inspirador y una imagen conceptual a partir de la descripción de un lote.

- Endpoint backend: `POST /api/imagine`.
- Página frontend: `/imagine`.
- Tamaño de imagen predeterminado: `1024x1024` (seleccionable también `768x768` y `512x512`).

### Variables de entorno

- `OPENAI_API_KEY`: clave de la API de OpenAI utilizada por el backend.
- `USE_MOCK_OPENAI`: si se establece en `true`, el backend usará respuestas simuladas (útil para pruebas locales).

> **Nota:** nunca compartas la clave real de OpenAI en el repositorio. Configúrala en tu entorno de ejecución.
