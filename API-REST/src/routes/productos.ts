import { FastifyPluginAsync } from "fastify";
import { validateApiKey, validateJWT, validateRole } from "../middleware/auth";
import { Product, CreateProductRequest, UpdateProductRequest } from "../interfaces/product";
import { ErrorResponse, SuccessResponse } from "../interfaces/response";
import { getProducts, saveProducts } from "../utils/files";

const productRoutes: FastifyPluginAsync = async (fastify, options) => {
  
  /**
   * GET: /api/productos/
   * Listado de productos, protegido por API Key. Con paginación (page, limit) y negociación de contenido (JSON, XML)
   */
  fastify.route({
    method: "GET",
    url: "/",
    preHandler: validateApiKey,
    handler: async (request, reply) => {
      try {
        const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
        
        // la paginación no puede ser negativa o cero, y el límite máximo es 100
        if (page < 1 || limit < 1 || limit > 100) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_PAGINATION_PARAMETERS',
              message: 'La página debe ser >= 1 y el límite debe estar entre 1 y 100',
              details: { page, limit },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // 422 entidad no puede ser procesada
        }
        
        // Cargar productos desde archivo JSON
        const products = await getProducts();
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = products.slice(startIndex, endIndex);
        
        const acceptHeader = request.headers.accept;
        
        const responseData = {
          products: paginatedProducts,
          pagination: {
            page,
            limit,
            total: products.length,
            totalPages: Math.ceil(products.length / limit)
          }
        };

        // Implementación de negociación de contenido: XML
        if (acceptHeader?.includes('application/xml')) {
          const xml = `<?xml version="1.0" encoding="UTF-8"?>
          <response>
            <code>PRODUCTS_RETRIEVED</code>
            <message>Products retrieved successfully</message>
            <data>
              <products>
                ${paginatedProducts.map(p => `
                  <product>
                    <id>${p.id}</id>
                    <sku>${p.sku}</sku>
                    <name>${p.name}</name>
                    <description>${p.description}</description>
                    <price>${p.price}</price>
                    <category>${p.category}</category>
                    <stock>${p.stock}</stock>
                  </product>
                `).join('')}
              </products>
            </data>
            <timestamp>${new Date().toISOString()}</timestamp>
          </response>`;
          
          return reply.type('application/xml').status(200).send(xml); // 200 OK
        }

        const successResponse: SuccessResponse<typeof responseData> = {
          code: 'PRODUCTS_RETRIEVED',
          message: 'Products retrieved successfully',
          data: responseData,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return reply.status(200).send(successResponse); // 200 OK

      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error retrieving products',
            details: { error: (error as Error).message },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(500).send(errorResponse); // 500 Internal Server Error
      }
    },
  });

  /**
   * GET: /api/productos/:id
   * Detalle de producto por id, protegido con API Key
   */
  fastify.route({
    method: "GET",
    url: "/:id",
    preHandler: validateApiKey,
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const productId = parseInt(id);

        if (isNaN(productId)) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_PRODUCT_ID',
              message: 'Product ID must be a valid number',
              details: { providedId: id },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // 422 entidad no puede ser procesada
        }

        // Cargar productos desde archivo JSON
        const products = await getProducts();
        const product = products.find(p => p.id === productId);

        if (!product) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found',
              details: { productId },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(404).send(errorResponse); // 404 no se encontró el producto
        }

        const successResponse: SuccessResponse<Product> = {
          code: 'PRODUCT_RETRIEVED',
          message: 'Product retrieved successfully',
          data: product,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return reply.status(200).send(successResponse); // 200 OK

      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error retrieving product',
            details: { error: (error as Error).message },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(500).send(errorResponse); // 500 Internal Server Error
      }
    },
  });

  /**
   * POST: /api/productos/
   * Crea un producto nuevo, protegido con JWT y rol editor o admin
   */
  fastify.route({
    method: "POST",
    url: "/",
    preHandler: [validateJWT, validateRole(['editor', 'admin'])],
    handler: async (request, reply) => {
      try {
        const productData = request.body as CreateProductRequest;

        // validacion de campos requeridos
        if (!productData.name || !productData.description || !productData.price || !productData.category || productData.stock === undefined || !productData.sku) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'MISSING_REQUIRED_FIELDS',
              message: 'SKU, name, description, price, category and stock are required',
              details: { 
                provided: Object.keys(productData),
                required: ['sku', 'name', 'description', 'price', 'category', 'stock']
              },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(400).send(errorResponse); // 400 Bad Request: hay campos faltantes
        }

        // se validan tipos de datos en los campos
        if (typeof productData.price !== 'number' || productData.price <= 0) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_PRICE',
              message: 'Price must be a positive number',
              details: { providedPrice: productData.price },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // 422 entidad no puede ser procesada
        }

        if (typeof productData.stock !== 'number' || productData.stock < 0) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_STOCK',
              message: 'Stock must be a non-negative number',
              details: { providedStock: productData.stock },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // 422 entidad no puede ser procesada
        }

        // Cargar productos desde archivo JSON
        const products = await getProducts();

        // Validar SKU único
        const existingSku = products.find(p => p.sku === productData.sku);
        if (existingSku) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'SKU_ALREADY_EXISTS',
              message: 'A product with this SKU already exists',
              details: { 
                sku: productData.sku,
                existingProductId: existingSku.id 
              },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(409).send(errorResponse); // 409 Conflict el sku ya existe
        }

        const newProduct: Product = {
          id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
          ...productData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        products.push(newProduct);
        await saveProducts(products);

        const successResponse: SuccessResponse<Product> = {
          code: 'PRODUCT_CREATED',
          message: 'Product created successfully',
          data: newProduct,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return reply.status(201).send(successResponse); // 201 Created

      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error creating product',
            details: { error: (error as Error).message },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(500).send(errorResponse); // 500 Internal Server Error
      }
    },
  });

  /**
   * PUT: /api/productos/:id
   * Actualiza un producto existente, protegido con JWT y rol editor o admin
   */
  fastify.route({
    method: "PUT",
    url: "/:id",
    preHandler: [validateJWT, validateRole(['editor', 'admin'])],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const productId = parseInt(id);
        const updateData = request.body as UpdateProductRequest;

        if (isNaN(productId)) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_PRODUCT_ID',
              message: 'Product ID must be a valid number',
              details: { providedId: id },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // La entidad no puede ser procesada
        }

        // Cargar productos desde archivo JSON
        const products = await getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found',
              details: { productId },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(404).send(errorResponse); // No se encontró el producto
        }

        // validación de tipos de datos (esto puede cambiar segun campos a actualizar)
        if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price <= 0)) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_PRICE',
              message: 'Price must be a positive number',
              details: { providedPrice: updateData.price },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // 422 la entidad no puede ser procesada
        }

        if (updateData.stock !== undefined && (typeof updateData.stock !== 'number' || updateData.stock < 0)) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_STOCK',
              message: 'Stock must be a non-negative number',
              details: { providedStock: updateData.stock },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // 422 la entidad no puede ser procesada
        }

        // Validar SKU unico en actualizacion
        if (updateData.sku) {
          const existingSku = products.find(p => p.sku === updateData.sku && p.id !== productId);
          if (existingSku) {
            const errorResponse: ErrorResponse = {
              error: {
                code: 'SKU_ALREADY_EXISTS',
                message: 'A product with this SKU already exists',
                details: { 
                  sku: updateData.sku,
                  existingProductId: existingSku.id 
                },
                timestamp: new Date().toISOString(),
                path: request.url,
              },
            };
            return reply.status(409).send(errorResponse); // 409 sku existente
          }
        }

        // Actualizar producto
        products[productIndex] = {
          ...products[productIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        await saveProducts(products);

        const successResponse: SuccessResponse<Product> = {
          code: 'PRODUCT_UPDATED',
          message: 'Product updated successfully',
          data: products[productIndex],
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return reply.status(200).send(successResponse); // 200 OK

      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error updating product',
            details: { error: (error as Error).message },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
        return reply.status(500).send(errorResponse); // 500 Internal Server Error
      }
    },
  });

  /**
   * DELETE: /api/productos/:id
   * Elimina un producto, protegido con JWT y rol admin
   */
  fastify.route({
    method: "DELETE",
    url: "/:id",
    preHandler: [validateJWT, validateRole(['admin'])],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const productId = parseInt(id);

        if (isNaN(productId)) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'INVALID_PRODUCT_ID',
              message: 'Product ID must be a valid number',
              details: { providedId: id },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(422).send(errorResponse); // 422 la entidad no puede ser procesada
        }

        // Cargar productos desde archivo JSON
        const products = await getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
          const errorResponse: ErrorResponse = {
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found',
              details: { productId },
              timestamp: new Date().toISOString(),
              path: request.url,
            },
          };
          return reply.status(404).send(errorResponse); // 404 no se encontró el producto
        }

        const deletedProduct = products.splice(productIndex, 1)[0];
        await saveProducts(products);

        const successResponse: SuccessResponse<Product> = {
          code: 'PRODUCT_DELETED',
          message: 'Product deleted successfully',
          data: deletedProduct,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return reply.status(200).send(successResponse); // 200 OK

      } catch (error) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error deleting product',
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

export default productRoutes;