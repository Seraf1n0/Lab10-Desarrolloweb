import { promises as fs } from 'fs';
import { join } from 'path';
import { Product } from '../interfaces/product';
import { User } from '../interfaces/user';

const DB_PATH = join(__dirname, '../db');

// Funciones de utilidad para manejar productos
export const getProducts = async (): Promise<Product[]> => {
  try {
    const data = await fs.readFile(join(DB_PATH, 'productos.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo productos.json:', error);
    return [];
  }
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  try {
    await fs.writeFile(
      join(DB_PATH, 'productos.json'), 
      JSON.stringify(products, null, 2), 
      'utf-8'
    );
  } catch (error) {
    console.error('Error al guardar el archivo productos.json:', error);
    throw new Error('Failed to save products');
  }
};

// Funciones de utilidad para manejar usuarios
export const getUsers = async (): Promise<(User & { password: string })[]> => {
  try {
    const data = await fs.readFile(join(DB_PATH, 'users.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo users.json:', error);
    return [];
  }
};

export const saveUsers = async (users: (User & { password: string })[]): Promise<void> => {
  try {
    await fs.writeFile(
      join(DB_PATH, 'users.json'), 
      JSON.stringify(users, null, 2), 
      'utf-8'
    );
  } catch (error) {
    console.error('Error al guardar el archivo users.json:', error);
    throw new Error('Failed to save users');
  }
};