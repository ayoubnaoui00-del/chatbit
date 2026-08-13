export type Role = 'client' | 'agent';

export interface User {
  id: number | string;
  fullname: string;
  email: string;
  role: Role;
  isonline?: boolean;
  createdat?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullname: string;
  email: string;
  password: string;
  role: Role;
}
