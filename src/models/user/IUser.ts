import { Role } from "./Role.js";

export interface IUser {
  id?: bigint;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  role: Role;

  // Authentication methods
  login(password: string): Promise<boolean>;
  logout(): void;
}
