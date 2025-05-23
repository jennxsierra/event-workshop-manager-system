import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import { Role } from "../models/user/Role.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export class AuthController extends BaseController {
  // Show login form
  showLoginForm(req: Request, res: Response): void {
    // If user is already logged in, redirect to home
    if (req.user) {
      return this.redirectWithMessage(res, "/", "You are already logged in");
    }

    this.render(res, "auth/login", { error: null });
  }

  // Process login request
  async login(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const { username, password } = req.body;

      // Check if credentials are provided
      if (!username || !password) {
        return this.render(res, "auth/login", {
          error: "Username and password are required",
          username,
        });
      }

      // First find the basic user info to create appropriate User object
      const userData = await prisma.user.findFirst({
        where: {
          username,
          deletedAt: null,
        },
      });

      if (!userData) {
        return this.render(res, "auth/login", {
          error: "Invalid username or password",
          username,
        });
      }
      
      // Create the appropriate user type instance
      let userInstance;
      const { Participant, Staff, Administrator } = await import("../models/user/index.js");
      
      if (userData.role === Role.ADMIN) {
        userInstance = new Administrator(
          username, 
          userData.firstName, 
          userData.lastName, 
          userData.email,
          userData.phone || undefined,
          userData.organization || undefined,
          userData.id
        );
      } else if (userData.role === Role.STAFF) {
        userInstance = new Staff(
          username, 
          userData.firstName, 
          userData.lastName, 
          userData.email,
          userData.phone || undefined,
          userData.organization || undefined,
          userData.id
        );
      } else {
        userInstance = new Participant(
          username, 
          userData.firstName, 
          userData.lastName, 
          userData.email,
          userData.phone || undefined,
          userData.organization || undefined,
          userData.id
        );
      }
      
      // Use the user class login method to authenticate
      const loginSuccess = await userInstance.login(password);
      
      if (!loginSuccess) {
        return this.render(res, "auth/login", {
          error: "Invalid username or password",
          username,
        });
      }

      // Set session
      req.session.userId = userInstance.id!.toString();

      // Redirect to dashboard or home page
      this.redirectWithMessage(res, "/", `Welcome back, ${userInstance.firstName}!`);
    });
  }

  // Show registration form
  showRegisterForm(req: Request, res: Response): void {
    // If user is already logged in, redirect to home
    if (req.user) {
      return this.redirectWithMessage(
        res,
        "/",
        "You are already registered and logged in"
      );
    }

    this.render(res, "auth/register", { error: null });
  }

  // Process registration request
  async register(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const {
        username,
        password,
        confirmPassword,
        firstName,
        lastName,
        email,
        phone,
        organization,
      } = req.body;

      // Validate required fields
      if (
        !username ||
        !password ||
        !confirmPassword ||
        !firstName ||
        !lastName ||
        !email
      ) {
        return this.render(res, "auth/register", {
          error: "All required fields must be filled",
          formData: req.body,
        });
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        return this.render(res, "auth/register", {
          error: "Passwords do not match",
          formData: {
            username,
            firstName,
            lastName,
            email,
            phone,
            organization,
          },
        });
      }

      // Check if username or email are already in use
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
          deletedAt: null,
        },
      });

      if (existingUser) {
        return this.render(res, "auth/register", {
          error: "Username or email is already in use",
          formData: {
            username,
            firstName,
            lastName,
            email,
            phone,
            organization,
          },
        });
      }

      // Create new user (default role is PARTICIPANT)
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          username,
          passwordHash,
          firstName,
          lastName,
          email,
          phone,
          organization,
          role: Role.PARTICIPANT,
        },
      });

      // Set session (auto-login after registration)
      req.session.userId = newUser.id.toString();

      // Redirect to dashboard or home page
      this.redirectWithMessage(
        res,
        "/",
        "Registration successful! Welcome to the Event Workshop Manager System"
      );
    });
  }

  // Process logout request
  async logout(req: Request, res: Response): Promise<void> {
    // If there's a user in the request, call the logout method
    if (req.user) {
      // Create an instance of the appropriate user class
      const { Participant, Staff, Administrator } = await import("../models/user/index.js");
      
      let userInstance;
      if (req.user.role === Role.ADMIN) {
        userInstance = new Administrator(
          req.user.username,
          req.user.firstName,
          req.user.lastName,
          req.user.email,
          req.user.phone,
          req.user.organization,
          req.user.id
        );
      } else if (req.user.role === Role.STAFF) {
        userInstance = new Staff(
          req.user.username,
          req.user.firstName,
          req.user.lastName,
          req.user.email,
          req.user.phone,
          req.user.organization,
          req.user.id
        );
      } else {
        userInstance = new Participant(
          req.user.username,
          req.user.firstName,
          req.user.lastName,
          req.user.email,
          req.user.phone,
          req.user.organization,
          req.user.id
        );
      }
      
      // Call the user's logout method
      userInstance.logout();
    }
    
    // Clear session userId
    req.session.userId = undefined;

    // Redirect to home page
    this.redirectWithMessage(res, "/", "You have been logged out");
  }
}
