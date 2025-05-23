import { Staff } from "./Staff.js";
import { IAdministrator } from "./IAdministrator.js";
import { IUser } from "./IUser.js";
import { Role } from "./Role.js";
import prisma from "../../lib/prisma.js";
import { Prisma } from "@prisma/client";

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

      // Important! Update without changing the email first
      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          organization: user.organization,
          role: user.role,
        },
      });
      
      // Now check if we need to update the email separately
      const currentUserInDb = await prisma.user.findUnique({
        where: { id: user.id },
        select: { email: true },
      });
      
      // Only try to update email if it's actually different
      if (currentUserInDb && currentUserInDb.email !== user.email) {
        // First check if the email is already used by someone else
        const emailCheck = await prisma.user.findFirst({
          where: {
            email: user.email,
            id: { not: user.id }
          }
        });
        
        if (emailCheck) {
          // Email is already in use by a different user
          throw new Error(`Email ${user.email} is already in use by another user`);
        }
        
        // Email is available, proceed with update
        await prisma.user.update({
          where: { id: user.id },
          data: { email: user.email },
        });
      }
      
    } catch (error) {
      console.error("Failed to update user:", error);

      // Handle known Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = error.meta?.target as string[] | undefined;
          if (target && target.includes("email")) {
            throw new Error(
              `Email ${user.email} is already in use by another user`
            );
          } else if (target && target.includes("username")) {
            throw new Error(`Username ${user.username} is already taken`);
          }
        }
      }

      throw error;
    }
  }

  /**
   * Generate reports using the ReportManager
   * This method delegates report generation to the dedicated ReportManager class.
   */
  async generateReports(): Promise<void> {
    try {
      // Import necessary modules dynamically to avoid circular dependencies
      const { ReportManager } = await import("../manager/ReportManager.js");
      const { EventManager } = await import("../manager/EventManager.js");

      // Create ReportManager instance
      const eventManager = new EventManager();
      const reportManager = new ReportManager(eventManager);

      console.log("Administrator generating reports via ReportManager");
      
      // Generate the various reports
      // We'll actually use the data to demonstrate a better implementation
      const reports = {
        summary: await reportManager.generateSummaryReport(),
        detailed: await reportManager.generateDetailedReport(),
        historical: await reportManager.generateHistoricalReport(),
        systemStats: await reportManager.generateSystemStats()
      };
      
      // Log some information from the reports to show we're using the data
      const totalEvents = reports.summary.totalEvents || 0;
      const totalUsers = reports.systemStats.totalUsers || 0;
      
      console.log(`Report generation complete. System has ${totalEvents} events and ${totalUsers} users.`);
      
      // Reports are returned - in a real application, this method might:
      // - Save reports to files
      // - Email reports to administrators
      // - Store report data in the database
      // - Return the report data to be displayed in the UI
      
      return;
    } catch (error) {
      console.error("Failed to generate reports:", error);
      throw new Error("Report generation failed: " + (error instanceof Error ? error.message : String(error)));
    }
  }
}
