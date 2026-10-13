export type UserRole = "recruiter" | "job_seeker";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
}
