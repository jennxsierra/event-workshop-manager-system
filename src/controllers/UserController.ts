import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import { Role } from "../models/user/Role.js";
import { Administrator } from "../models/user/Administrator.js";
import { Staff } from "../models/user/Staff.js";
import { Participant } from "../models/user/Participant.js";
import prisma from "../lib/prisma.js";

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

      this.render(res, "users/index", { users });
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

      this.render(res, "users/profile", {
        user: userData,
        registrations,
        isOwnProfile: req.user?.id === userId,
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
      });
    });
  }

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      let userId = req.user?.id;

      if (req.params.id && req.params.id !== "profile") {
        try {
          userId = BigInt(req.params.id);
        } catch {
          userId = req.user?.id;
        }
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
          // Regular user updating their own profile
          await prisma.user.update({
            where: { id: userId },
            data: {
              firstName,
              lastName,
              email,
              phone,
              organization,
            },
          });
        }

        this.redirectWithMessage(
          res,
          `/users/profile`,
          "Profile updated successfully"
        );
      } catch (error) {
        console.error("Failed to update profile:", error);
        this.render(res, "users/edit", {
          user: { ...req.body, id: userId },
          isAdmin: req.user?.role === Role.ADMIN,
          roles: Object.values(Role),
          error: "Failed to update profile",
        });
      }
    });
  }
}
