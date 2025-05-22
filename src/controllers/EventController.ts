import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import { EventManager } from "../models/manager/EventManager.js";
import { Event } from "../models/event/Event.js";
import { EventCategory } from "../models/event/EventCategory.js";
import { Role } from "../models/user/Role.js";
import { Participant } from "../models/user/Participant.js";
import { Staff } from "../models/user/Staff.js";
import { Administrator } from "../models/user/Administrator.js";
import prisma from "../lib/prisma.js";

export class EventController extends BaseController {
  private eventManager: EventManager;

  constructor() {
    super();
    this.eventManager = new EventManager();
  }

  // Helper method to create appropriate User instance from req.user
  private createUserFromRequest(
    reqUser: Express.Request["user"]
  ): Participant | Staff | Administrator | null {
    if (!reqUser) return null;

    if (reqUser.role === Role.ADMIN) {
      return new Administrator(
        reqUser.username,
        reqUser.firstName,
        reqUser.lastName,
        reqUser.email,
        reqUser.phone,
        reqUser.organization,
        reqUser.id
      );
    } else if (reqUser.role === Role.STAFF) {
      return new Staff(
        reqUser.username,
        reqUser.firstName,
        reqUser.lastName,
        reqUser.email,
        reqUser.phone,
        reqUser.organization,
        reqUser.id
      );
    } else {
      return new Participant(
        reqUser.username,
        reqUser.firstName,
        reqUser.lastName,
        reqUser.email,
        reqUser.phone,
        reqUser.organization,
        reqUser.id
      );
    }
  }

  // Get all events
  async getEvents(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Extract filter parameters
      const { category, date } = req.query;

      // Apply filters if they exist
      const filters = {
        category: category as string,
        date: date as string,
      };

      const events = await this.eventManager.getEvents(filters);

      this.render(res, "events/index", {
        events,
        pageName: "events",
        // Pass filters back to the view for maintaining selected values
        selectedCategory: category,
        selectedDate: date,
      });
    });
  }

  // Get details for a specific event
  async getEventDetails(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const eventId = BigInt(req.params.id);

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          registrations: {
            where: { cancelled: false },
            include: { participant: true },
          },
        },
      });

      if (!event) {
        return this.renderError(res, "Event not found", 404);
      }

      this.render(res, "events/details", {
        event: new Event(
          event.name,
          event.eventDate,
          event.startTime,
          event.location,
          event.category as EventCategory,
          event.capacity,
          event.id,
          event.endTime || undefined,
          event.description || undefined
        ),
        registrations: event.registrations,
        pageName: "events",
      });
    });
  }

  // Show form to create a new event
  showCreateEventForm(_req: Request, res: Response): void {
    this.render(res, "events/create", {
      categories: Object.values(EventCategory),
      pageName: "events",
    });
  }

  // Create a new event
  async createEvent(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is authorized
      if (!req.user || ![Role.STAFF, Role.ADMIN].includes(req.user.role)) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const currentUser = this.createUserFromRequest(req.user);
      if (!currentUser) {
        return this.renderError(res, "Invalid user information", 403);
      }

      // Validate form data
      const {
        name,
        date,
        time,
        location,
        category,
        capacity,
        endTime,
        description,
      } = req.body;

      if (!name || !date || !time || !location || !category || !capacity) {
        return this.render(res, "events/create", {
          categories: Object.values(EventCategory),
          error: "All required fields must be filled",
          formData: req.body,
        });
      }

      // Create event object
      const eventDate = new Date(date);
      const eventTime = new Date(`${date}T${time}`);
      const eventEndTime = endTime ? new Date(`${date}T${endTime}`) : undefined;

      const event = new Event(
        name,
        eventDate,
        eventTime,
        location,
        category as EventCategory,
        parseInt(capacity),
        undefined,
        eventEndTime,
        description
      );

      // Save the event
      const success = await this.eventManager.createEvent(event, currentUser);

      if (success) {
        this.redirectWithMessage(res, "/events", "Event created successfully");
      } else {
        this.render(res, "events/create", {
          categories: Object.values(EventCategory),
          error: "Failed to create event",
          formData: req.body,
        });
      }
    });
  }

  // Show form to edit an event
  async showEditEventForm(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      const eventId = BigInt(req.params.id);

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          registrations: {
            where: { cancelled: false },
          },
        },
      });

      if (!event) {
        return this.renderError(res, "Event not found", 404);
      }

      // Count active registrations
      const registrationsCount = event.registrations.length;

      this.render(res, "events/edit", {
        event: new Event(
          event.name,
          event.eventDate,
          event.startTime,
          event.location,
          event.category as EventCategory,
          event.capacity,
          event.id,
          event.endTime || undefined,
          event.description || undefined
        ),
        categories: Object.values(EventCategory),
        pageName: "events",
        registrationsCount,
      });
    });
  }

  // Update an event
  async updateEvent(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is authorized
      if (!req.user || ![Role.STAFF, Role.ADMIN].includes(req.user.role)) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const currentUser = this.createUserFromRequest(req.user);
      if (!currentUser) {
        return this.renderError(res, "Invalid user information", 403);
      }

      const eventId = BigInt(req.params.id);

      // Validate form data
      const {
        name,
        date,
        time,
        location,
        category,
        capacity,
        endTime,
        description,
      } = req.body;

      if (!name || !date || !time || !location || !category || !capacity) {
        // Get registration count for error redisplay
        const eventData = await prisma.event.findUnique({
          where: { id: eventId },
          include: { registrations: { where: { cancelled: false } } },
        });

        const registrationsCount = eventData?.registrations.length || 0;

        return this.render(res, "events/edit", {
          categories: Object.values(EventCategory),
          error: "All required fields must be filled",
          event: { ...req.body, id: eventId },
          registrationsCount,
        });
      }

      // Create event object
      const eventDate = new Date(date);
      const eventTime = new Date(`${date}T${time}`);
      const eventEndTime = endTime ? new Date(`${date}T${endTime}`) : undefined;

      const event = new Event(
        name,
        eventDate,
        eventTime,
        location,
        category as EventCategory,
        parseInt(capacity),
        eventId,
        eventEndTime,
        description
      );

      // Update the event
      const success = await this.eventManager.updateEvent(event, currentUser);

      if (success) {
        this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "Event updated successfully"
        );
      } else {
        // Get registration count for error redisplay
        const eventData = await prisma.event.findUnique({
          where: { id: eventId },
          include: { registrations: { where: { cancelled: false } } },
        });

        const registrationsCount = eventData?.registrations.length || 0;

        this.render(res, "events/edit", {
          categories: Object.values(EventCategory),
          error: "Failed to update event",
          event: { ...req.body, id: eventId },
          registrationsCount,
        });
      }
    });
  }

  // Delete an event
  async deleteEvent(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is authorized
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const currentUser = this.createUserFromRequest(req.user);
      if (!currentUser) {
        return this.renderError(res, "Invalid user information", 403);
      }

      const eventId = BigInt(req.params.id);

      // Get the event
      const eventData = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!eventData) {
        return this.renderError(res, "Event not found", 404);
      }

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

      // Delete the event
      const success = await this.eventManager.deleteEvent(event, currentUser);

      if (success) {
        this.redirectWithMessage(res, "/events", "Event deleted successfully");
      } else {
        this.redirectWithMessage(
          res,
          `/events/${eventId}`,
          "Failed to delete event",
          "error"
        );
      }
    });
  }
}
