import { Product } from "../types/Product";

const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'noseekisde';

// Modelos de datos para las respuestas de la API
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    path: string;
  };
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Función para traer productos con paginación y formato
export async function fetchProducts(
  page: number = 1, 
  limit: number = 10,
  formato: 'json' | 'xml' = 'json'
): Promise<{ products: Product[], pagination: ProductsResponse['pagination'], rawData?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/productos?page=${page}&limit=${limit}`, 
      {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
          'Accept': formato === 'xml' ? 'application/xml' : 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (formato === 'xml') {
      const rawData = await response.text();
      // aqui falta parsear a XML
      return {
        products: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        rawData
      };
    } else {
      const data: ApiResponse<ProductsResponse> = await response.json();
      return {
        products: data.data.products,
        pagination: data.data.pagination,
        rawData: JSON.stringify(data, null, 2)
      };
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Funcion para traer el detalle de un producto por ID
export async function fetchProductById(
  id: number,
  formato: 'json' | 'xml' = 'json'
): Promise<{ product: Product | null, rawData: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/productos/${id}`, 
      {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
          'Accept': formato === 'xml' ? 'application/xml' : 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (formato === 'xml') {
      const rawData = await response.text();
      return {
        product: null,
        rawData
      };
    } else {
      const rawData = await response.text();
      const data: ApiResponse<Product> = JSON.parse(rawData);
      return {
        product: data.data,
        rawData: JSON.stringify(data, null, 2)
      };
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}