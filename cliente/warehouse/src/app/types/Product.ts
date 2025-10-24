export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// Para la lista y cards
export interface ProductResumen {
  id: number;
  sku: string;
  name: string;
  price: number;
}
