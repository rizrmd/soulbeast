import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { router } from './router'

// Create OpenAPI generator with Zod schema converter
const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()]
})

// Generate OpenAPI specification
export const generateOpenAPISpec = async () => {
  const spec = await generator.generate(router, {
    info: {
      title: 'SoulBeast API',
      version: '1.0.0',
      description: 'Type-safe API for SoulBeast card battle game',
      contact: {
        name: 'SoulBeast Team',
        email: 'dev@soulbeast.game'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/rpc',
        description: 'Development server'
      },
      {
        url: 'https://api.soulbeast.game/api/rpc',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'inventory',
        description: 'Player inventory management'
      },
      {
        name: 'soulbeast',
        description: 'SoulBeast creature management'
      },
      {
        name: 'battle',
        description: 'Battle history and statistics'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token'
        }
      }
    },
    security: [
      { BearerAuth: [] },
      { CookieAuth: [] }
    ]
  })

  return spec
}

// Export the spec for use in the server
export const openAPISpec = generateOpenAPISpec()