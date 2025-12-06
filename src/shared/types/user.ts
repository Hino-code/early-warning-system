export type UserRole =
  | "Administrator"
  | "Researcher"
  | "Field Manager"
  | "Demo User";

export type UserStatus = "pending" | "approved";

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface RegistrationPayload {
  name: string;
  email: string;
  agency: string;
  role: UserRole;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  agency: string;
  role: UserRole;
  submittedAt: string;
}

export interface AuthSession {
  token: string;
  user: AppUser;
}
