import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import { EventCategory } from "../models/event/EventCategory.js";
import { Event } from "../models/event/Event.js";
import { Participant } from "../models/user/Participant.js";
import prisma from "../lib/prisma.js";

export class RegistrationController extends BaseController {
  // Register for an event
  async registerForEvent(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const eventId = BigInt(req.params.id);

      // Check if user is logged in
      if (!req.user) {
        return this.redirectWithMessage(
          res,
          "/auth/login",
          "Please log in to register for events",
          "error"
        );
      }

      // Check if event exists
      const eventData = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!eventData) {
        return this.renderError(res, "Event not found", 404);
      }

      // Check if user is already registered for this event
      const existingRegistration = await prisma.registration.findFirst({
        where: {
          eventId,
          participantId: req.user.id,
          cancelled: false,
        },
      });

      if (existingRegistration) {
        return this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "You are already registered for this event",
          "info"
        );
      }
      
      // Check if event has reached capacity
      const activeRegistrationsCount = await prisma.registration.count({
        where: {
          eventId,
          cancelled: false,
        },
      });

      if (activeRegistrationsCount >= eventData.capacity) {
        return this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "Sorry, this event has reached its capacity",
          "error"
        );
      }
      
      // Check if event has already passed
      const eventDate = new Date(eventData.eventDate);
      const currentDate = new Date();
      if (eventDate < currentDate) {
        return this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "Sorry, registration is not available for past events",
          "error"
        );
      }

      // Create event and participant objects
      const event = new Event(
        eventData.name,
        eventData.eventDate,
        eventData.startTime,
        eventData.location,
        eventData.category as EventCategory,
        eventData.capacity,
        eventData.id,
        eventData.endTime || undefined
      );

      const participant = new Participant(
        req.user.username,
        req.user.firstName,
        req.user.lastName,
        req.user.email,
        req.user.phone || undefined,
        req.user.organization || undefined,
        req.user.id
      );

      // Register for the event
      try {
        const success = await participant.registerForEvent(event);
        
        if (success) {
          this.redirectWithMessage(
            res,
            `/events/${eventId}`,
            "Registration successful"
          );
        } else {
          this.redirectWithMessage(
            res,
            `/events/${eventId}`,
            "Failed to register for this event",
            "error"
          );
        }
      } catch (error) {
        // Handle specific error from the Participant model
        const errorMessage = error instanceof Error ? error.message : "Failed to register for this event";
        this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          errorMessage,
          "error"
        );
      }
    });
  }

  // Cancel registration for an event
  async cancelRegistration(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const eventId = BigInt(req.params.id);

      // Check if user is logged in
      if (!req.user) {
        return this.redirectWithMessage(
          res,
          "/auth/login",
          "Please log in to manage your registrations",
          "error"
        );
      }

      // Check if event exists
      const eventData = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!eventData) {
        return this.renderError(res, "Event not found", 404);
      }

      // Check if user is registered for this event
      const existingRegistration = await prisma.registration.findFirst({
        where: {
          eventId,
          participantId: req.user.id,
          cancelled: false,
        },
      });

      if (!existingRegistration) {
        return this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "You are not registered for this event",
          "info"
        );
      }

      // Create event and participant objects
      const event = new Event(
        eventData.name,
        eventData.eventDate,
        eventData.startTime,
        eventData.location,
        eventData.category as EventCategory,
        eventData.capacity,
        eventData.id,
        eventData.endTime || undefined
      );

      const participant = new Participant(
        req.user.username,
        req.user.firstName,
        req.user.lastName,
        req.user.email,
        req.user.phone || undefined,
        req.user.organization || undefined,
        req.user.id
      );

      // Cancel the registration
      const success = await participant.cancelRegistration(event);

      if (success) {
        this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "Registration cancelled successfully"
        );
      } else {
        this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "Failed to cancel registration",
          "error"
        );
      }
    });
  }

  // View user's own registrations
  async viewMyRegistrations(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is logged in
      if (!req.user) {
        return this.redirectWithMessage(
          res,
          "/auth/login",
          "Please log in to view your registrations",
          "error"
        );
      }
      
      // Get the tab from query parameter, default to 'upcoming' if not provided
      const tab = req.query.tab as string || 'upcoming';
      
      // Get current date for filtering
      const now = new Date();
      
      // Prepare filter conditions based on tab
      let whereCondition: any = {
        participantId: req.user.id,
      };
      
      if (tab === 'upcoming') {
        whereCondition = {
          ...whereCondition,
          event: {
            eventDate: {
              gte: now,
            }
          },
          cancelled: false
        };
      } else if (tab === 'past') {
        whereCondition = {
          ...whereCondition,
          event: {
            eventDate: {
              lt: now,
            }
          },
          cancelled: false
        };
      } else if (tab === 'cancelled') {
        whereCondition = {
          ...whereCondition,
          cancelled: true
        };
      }

      const registrations = await prisma.registration.findMany({
        where: whereCondition,
        include: {
          event: true,
          participant: true,
        },
        orderBy: { registeredAt: "desc" },
      });

      this.render(res, "registrations/myregistrations", {
        registrations,
        pageName: "myregistrations",
        tab: tab,
        currentDate: now
      });
    });
  }

  // View all registrations (admin and staff only)
  async viewAllRegistrations(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is authorized
      if (!req.user || !["ADMIN", "STAFF"].includes(req.user.role)) {
        return this.renderError(res, "Unauthorized", 403);
      }
      
      // No longer filtering by default - show all registrations
      let whereCondition: any = {};
      
      // Get events for the filter dropdown
      const events = await prisma.event.findMany({
        orderBy: { name: "asc" },
      });
      
      // Get the filters from query parameters
      const filters = {
        eventId: req.query.eventId ? BigInt(req.query.eventId as string) : undefined,
        status: req.query.status as string || "",
        search: req.query.search as string || "",
      };
      
      // Apply additional filters if provided
      if (filters.eventId) {
        whereCondition.eventId = filters.eventId;
      }
      
      if (filters.status === 'registered') {
        whereCondition.cancelled = false;
        whereCondition.attended = false;
      } else if (filters.status === 'attended') {
        whereCondition.attended = true;
        whereCondition.cancelled = false; // Only non-cancelled registrations can be marked as attended
      } else if (filters.status === 'cancelled') {
        whereCondition.cancelled = true;
      }
      
      if (filters.search) {
        whereCondition.participant = {
          OR: [
            { firstName: { contains: filters.search } },
            { lastName: { contains: filters.search } },
            { email: { contains: filters.search } }
          ]
        };
      }

      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      
      // Get total count for pagination
      const totalItems = await prisma.registration.count({
        where: whereCondition,
      });
      
      const totalPages = Math.ceil(totalItems / limit);

      const registrations = await prisma.registration.findMany({
        where: whereCondition,
        include: {
          event: true,
          participant: true,
        },
        orderBy: { registeredAt: "desc" },
        skip,
        take: limit,
      });

      // Build query string for use in export link and pagination
      const queryParams = new URLSearchParams(req.query as any);
      queryParams.delete('page'); // Remove page from the query params for clean pagination links
      const queryString = queryParams.toString();

      this.render(res, "registrations/manage", {
        registrations,
        events,
        pageName: "registrations",
        filters,
        queryString,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          baseUrl: '/registrations/manage',
          queryParams: queryString ? `&${queryString}` : ''
        }
      });
    });
  }
}
