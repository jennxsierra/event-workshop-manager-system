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

  // Methods
  login(): Promise<boolean>;
  logout(): void;
}
