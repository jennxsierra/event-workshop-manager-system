import { Role } from "./Role.js";
import { IUser } from "./IUser.js";

export abstract class User implements IUser {
  id?: bigint;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  role: Role;

  constructor(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    role: Role,
    phone?: string,
    organization?: string,
    id?: bigint
  ) {
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.phone = phone;
    this.organization = organization;
    this.id = id;
  }

  async login(): Promise<boolean> {
    // Implementation will be added later
    console.log(`${this.username} is logging in`);
    return true;
  }

  logout(): void {
    console.log(`${this.username} is logging out`);
  }
}
