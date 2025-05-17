import { Staff } from "./Staff.js";
import { IAdministrator } from "./IAdministrator.js";
import { IUser } from "./IUser.js";
import { Role } from "./Role.js";
import prisma from "../../lib/prisma.js";

export class Administrator extends Staff implements IAdministrator {
  constructor(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    phone?: string,
    organization?: string,
    id?: bigint
  ) {
    super(username, firstName, lastName, email, phone, organization, id);
    this.role = Role.ADMIN;
  }

  async updateUser(user: IUser): Promise<void> {
    try {
      if (!user.id) {
        throw new Error("User must have an ID to be updated");
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          organization: user.organization,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  }

  async generateReports(): Promise<void> {
    console.log("Generating reports as admin");
    // Report generation will be implemented later
  }
}
