import { FastifyRequest, FastifyReply } from "fastify";
import { ErrorResponse } from "../interfaces/response"; // Importamos la interface de respuesta estandar

// Middleware de validación de API Key
export const validateApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const apiKey = request.headers['x-api-key'] as string;
  
  if (!apiKey) {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'API_KEY_MISSING',
        message: 'API Key is required',
        details: {},
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };
    return reply.status(401).send(errorResponse);
  }

  // Como es explorativo, esto es un mock
  if (apiKey !== '123456') {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API Key',
        details: {},
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };
    return reply.status(401).send(errorResponse);
  }
};

// Middleware para validación de JWT
export const validateJWT = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        details: {},
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };
    return reply.status(401).send(errorResponse);
  }
};

// Middleware para validación de roles (ejemplo: admin, user, etc)
export const validateRole = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    
    if (!user || !allowedRoles.includes(user.role)) {
      const errorResponse: ErrorResponse = {
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions',
          details: { requiredRoles: allowedRoles },
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      };
      return reply.status(403).send(errorResponse);
    }
  };
};