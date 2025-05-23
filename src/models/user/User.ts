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

  /**
   * Authenticate user with provided password
   * @param password Plain text password to verify
   * @returns Promise resolving to true if login is successful, false otherwise
   */
  async login(password: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    const prisma = (await import('../../lib/prisma.js')).default;

    try {
      // Find user by username
      const user = await prisma.user.findFirst({
        where: {
          username: this.username,
          deletedAt: null,
        },
      });

      // Check if user exists and password is correct
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return false;
      }

      // Update the instance properties with DB values
      this.id = user.id;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
      this.phone = user.phone ?? undefined;
      this.organization = user.organization ?? undefined;
      this.role = user.role as Role;

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  /**
   * Logout the user (no actual implementation needed in this class)
   * In a real application, this would be handled by the auth controller
   * by clearing the session.
   */
  logout(): void {
    console.log(`${this.username} has logged out`);
    // The actual session clearing happens in AuthController.logout
  }
}
