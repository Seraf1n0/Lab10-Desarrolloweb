import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import productRoutes from "./routes/productos";
import userRoutes from "./routes/users";
import { ErrorResponse, SuccessResponse } from "./interfaces/response";

const fastify = Fastify({
  logger: true,
});

// Registrar JWT globalmente
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || "jwtMock",
});

//Middleware de respuestas estandarizadas y CORS

// Manejador para rutas no encontradas
fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  const errorResponse: ErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      details: {},
      timestamp: new Date().toISOString(),
      path: request.url,
    },
  };
  reply.status(404).send(errorResponse);
});

// Manejador para errores generales
fastify.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
  const errorResponse: ErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: {
        method: request.method,
        url: request.url,
        body: request.body,
        error: error.message,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    },
  };
  reply.status(500).send(errorResponse);
});

fastify.register(cors, {
  origin: ["http://localhost:3000"], // Esto cambia dependiendo de dónde venga el frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

// Rutas definidas
fastify.get("/api/status", async (request, reply) => {
  const successResponse: SuccessResponse<{ status: string }> = {
    code: 'SERVER_STATUS',
    message: 'Server is running',
    data: { status: "OK" },
    timestamp: new Date().toISOString(),
    path: request.url,
  };
  return successResponse;
});

// Rutas productos de routes/products.ts
fastify.register(productRoutes, { prefix: "/api/productos" });

// Rutas usuarios de routes/users.ts
fastify.register(userRoutes, { prefix: "/api/usuarios" });

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Servidor API corriendo en http://localhost:3000 🌐");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
