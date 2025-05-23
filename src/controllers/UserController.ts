import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import { Role } from "../models/user/Role.js";
import { Administrator } from "../models/user/Administrator.js";
import { Staff } from "../models/user/Staff.js";
import { Participant } from "../models/user/Participant.js";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

export class UserController extends BaseController {
  // Helper to safely handle null or undefined
  private nullToUndefined<T>(value: T | null): T | undefined {
    return value === null ? undefined : value;
  }

  // Get a list of users (admin only)
  async getUsers(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      const user = req.user;
      if (!user || user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      this.render(res, "users/index", {
        users,
        pageName: "users",
      });
    });
  }

  // Get user profile
  async getUserProfile(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const userId = req.params.id ? BigInt(req.params.id) : req.user?.id;

      if (!userId) {
        return this.redirectWithMessage(
          res,
          "/auth/login",
          "Please log in to view profiles",
          "error"
        );
      }

      // Check permissions - users can view their own profile, admins can view any profile
      if (req.user?.id !== userId && req.user?.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const userData = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userData) {
        return this.renderError(res, "User not found", 404);
      }

      // Find user's registrations if it's the current user's profile
      const registrations =
        req.user?.id === userId
          ? await prisma.registration.findMany({
              where: {
                participantId: userId,
                cancelled: false,
              },
              include: {
                event: true,
              },
            })
          : [];

      // Calculate activity statistics
      const currentDate = new Date();
      let stats = {
        registrations: 0,
        attended: 0,
        upcoming: 0
      };
      
      if (registrations.length > 0) {
        // Total registrations
        stats.registrations = registrations.length;
        
        // Count attended vs upcoming events
        stats.attended = registrations.filter(reg => new Date(reg.event.eventDate) < currentDate).length;
        stats.upcoming = registrations.filter(reg => new Date(reg.event.eventDate) >= currentDate).length;
      }

      this.render(res, "users/profile", {
        user: userData,
        registrations,
        stats,
        isOwnProfile: req.user?.id === userId,
        pageName: "users",
      });
    });
  }

  // Show form to edit user profile
  async showEditProfileForm(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const userId = req.params.id ? BigInt(req.params.id) : req.user?.id;

      if (!userId) {
        return this.redirectWithMessage(
          res,
          "/auth/login",
          "Please log in to edit profiles",
          "error"
        );
      }

      // Check permissions - users can edit their own profile, admins can edit any profile
      if (req.user?.id !== userId && req.user?.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const userData = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userData) {
        return this.renderError(res, "User not found", 404);
      }

      this.render(res, "users/edit", {
        user: userData,
        isAdmin: req.user?.role === Role.ADMIN,
        roles: Object.values(Role),
        pageName: "users",
      });
    });
  }

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Default to the current user's ID
      let userId = req.user?.id;
      
      // Check the URL pattern to determine whose profile we're updating
      if (req.params.id && req.params.id !== "profile") {
        try {
          // This is an admin editing another user
          userId = BigInt(req.params.id);
          console.log(`Admin editing user with ID: ${userId} via path parameter`);
        } catch (e) {
          console.error(`Invalid user ID in params: ${req.params.id}`);
          userId = req.user?.id;
        }
      } else {
        console.log(`User editing their own profile (ID: ${userId})`);
      }

      if (!userId) {
        return this.redirectWithMessage(
          res,
          "/auth/login",
          "Please log in to update profiles",
          "error"
        );
      }

      // Check permissions - users can update their own profile, admins can update any profile
      if (req.user?.id !== userId && req.user?.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const userData = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userData) {
        return this.renderError(res, "User not found", 404);
      }

      // Extract form data
      const { firstName, lastName, email, phone, organization } = req.body;

      // Check if the submitted email is the same as the current user's email
      if (email.trim().toLowerCase() === userData.email.trim().toLowerCase()) {
        console.log("Email unchanged, using original email for consistency");
      }

      // Only admins can change roles
      let role = userData.role;
      if (req.user?.role === Role.ADMIN && req.body.role) {
        role = req.body.role;
      }

      // Update user data
      try {
        // Create appropriate user instance based on role
        let user;
        if (role === Role.ADMIN) {
          user = new Administrator(
            userData.username,
            firstName,
            lastName,
            email,
            this.nullToUndefined(phone || null),
            this.nullToUndefined(organization || null),
            userId
          );
        } else if (role === Role.STAFF) {
          user = new Staff(
            userData.username,
            firstName,
            lastName,
            email,
            this.nullToUndefined(phone || null),
            this.nullToUndefined(organization || null),
            userId
          );
        } else {
          user = new Participant(
            userData.username,
            firstName,
            lastName,
            email,
            this.nullToUndefined(phone || null),
            this.nullToUndefined(organization || null),
            userId
          );
        }

        // Update the user profile
        if (req.user?.role === Role.ADMIN) {
          console.log(`Admin ${req.user.username} (ID: ${req.user.id}) is updating user ${user.username} (ID: ${user.id})`);
          const admin = new Administrator(
            req.user.username,
            req.user.firstName,
            req.user.lastName,
            req.user.email,
            this.nullToUndefined(req.user.phone || null),
            this.nullToUndefined(req.user.organization || null),
            req.user.id
          );
          await admin.updateUser(user);
        } else {
          // Regular user updating their own profile - using the same approach as in Administrator
          // Important! Update non-email fields first
          await prisma.user.update({
            where: { id: userId },
            data: {
              firstName,
              lastName,
              phone,
              organization,
            },
          });
          
          // Now check if we need to update the email separately
          const currentUserInDb = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });
          
          // Only try to update email if it's actually different
          if (currentUserInDb && currentUserInDb.email !== email) {
            try {
              await prisma.user.update({
                where: { id: userId },
                data: { email: email },
              });
            } catch (emailError) {
              if (emailError instanceof Prisma.PrismaClientKnownRequestError &&
                  emailError.code === "P2002") {
                throw new Error(`Email ${email} is already in use by another user`);
              }
              throw emailError;
            }
          }
        }

        // Determine the appropriate redirect based on who is being updated and who is doing the updating
        const isAdmin = req.user?.role === Role.ADMIN;
        const isEditingOwnProfile = req.user?.id === userId;
        
        if (isAdmin && !isEditingOwnProfile) {
          // Admin editing someone else's profile - redirect to users list
          this.redirectWithMessage(
            res,
            `/users`,
            "Profile updated successfully"
          );
        } else {
          // User editing their own profile - redirect to profile page
          this.redirectWithMessage(
            res,
            `/users/profile`,
            "Profile updated successfully"
          );
        }
      } catch (error) {
        console.error("Failed to update profile:", error);
        
        let errorMessage = "Failed to update profile";
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes("already in use")) {
            errorMessage = error.message;
          } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
            const target = error.meta?.target as string[] | undefined;
            if (error.code === 'P2002' && target && target.includes('email')) {
              errorMessage = "This email is already registered to another user";
            } else if (error.code === 'P2002' && target && target.includes('username')) {
              errorMessage = "This username is already taken";
            }
          }
        }
        
        this.render(res, "users/edit", {
          user: { ...req.body, id: userId },
          isAdmin: req.user?.role === Role.ADMIN,
          roles: Object.values(Role),
          error: errorMessage,
        });
      }
    });
  }

  // Delete a user (admin only)
  async deleteUser(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const userId = req.params.id ? BigInt(req.params.id) : undefined;

      if (!userId) {
        return this.renderError(res, "Invalid user ID", 400);
      }

      // Don't allow admins to delete themselves
      if (req.user.id === userId) {
        return this.redirectWithMessage(
          res,
          "/users",
          "You cannot delete your own account",
          "error"
        );
      }

      try {
        // Soft delete by setting deletedAt field
        await prisma.user.update({
          where: { id: userId },
          data: { deletedAt: new Date() }
        });

        this.redirectWithMessage(
          res,
          "/users",
          "User deleted successfully"
        );
      } catch (error) {
        console.error("Failed to delete user:", error);
        this.redirectWithMessage(
          res,
          "/users",
          "Failed to delete user",
          "error"
        );
      }
    });
  }
}
