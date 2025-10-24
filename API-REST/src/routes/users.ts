import { FastifyPluginAsync } from "fastify";
import { validateApiKey } from "../middleware/auth";
import { LoginRequest, User, UserWithPassword } from "../interfaces/user";
import { ErrorResponse, SuccessResponse } from "../interfaces/response";
import { getUsers } from "../utils/files";

const userRoutes: FastifyPluginAsync = async (fastify, options) => {
  /**
   * POST: /api/usuarios/auth/login
   * Body: { username, password, apiKey }
   * Respuesta: { token } con respuesta 200 o error con 401/400
   */
  fastify.route({
    method: "POST",
    url: "/auth/login",
    preHandler: validateApiKey,
    handler: async (request, reply) => {
      const { username, password, apiKey } = request.body as LoginRequest;

      // Validación de campos requeridos
      if (!username || !password || !apiKey) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'MISSING_FIELDS',
            message: 'Username, password and apiKey are required',
            details: {
              provided: {
                username: !!username,
                password: !!password,
                apiKey: !!apiKey
              }
            },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(400).send(errorResponse); // 400 Bad Request por campos faltantes
      }

      // Validar tipos de datos
      if (typeof username !== 'string' || typeof password !== 'string' || typeof apiKey !== 'string') {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INVALID_DATA_TYPES',
            message: 'Username, password and apiKey must be strings',
            details: {
              types: {
                username: typeof username,
                password: typeof password,
                apiKey: typeof apiKey
              }
            },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(422).send(errorResponse); // 422 la entidad no puede ser procesada
      }

      // Validar longitud mínima
      if (username.length < 3 || password.length < 6) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INVALID_FIELD_LENGTH',
            message: 'Username must be at least 3 characters and password at least 6 characters',
            details: {
              usernameLength: username.length,
              passwordLength: password.length,
              minimumLengths: { username: 3, password: 6 }
            },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(422).send(errorResponse); // 422 entidad no puede ser procesada
      }

      try {
        // Cargar usuarios desde archivo JSON
        const users = await getUsers();
        
        // Buscar usuario por username
        const user = users.find(u => u.username === username);

        if (!user || user.password !== password) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid username or password',
              details: {},
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(401).send(errorResponse); // 401 Unauthorized
        }

        // Generar JWT
        const token = fastify.jwt.sign({ 
          id: user.id, 
          username: user.username, 
          role: user.role 
        });

        const successResponse: SuccessResponse<{ token: string; user: Omit<User, 'id'> }> = {
          code: 'LOGIN_SUCCESS',
          message: 'Login successful',
          data: { 
            token,
            user: {
              username: user.username,
              role: user.role
            }
          },
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return reply.status(200).send(successResponse); // 200 OK

      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error during authentication',
            details: { error: (error as Error).message },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(500).send(errorResponse); // 500 Internal Server Error
      }
    },
  });
};

export default userRoutes;