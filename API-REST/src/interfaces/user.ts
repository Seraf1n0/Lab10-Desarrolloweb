// Interfaces para menejar usuarios y sus datos

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
}

// EN caso de que un usuario requierea contraseña (manejo interno)
export interface UserWithPassword extends User {
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  apiKey: string;
}