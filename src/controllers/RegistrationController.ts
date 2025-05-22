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

  // View all registrations (admin and staff only)
  async viewAllRegistrations(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is authorized
      if (!req.user || !["ADMIN", "STAFF"].includes(req.user.role)) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const registrations = await prisma.registration.findMany({
        include: {
          event: true,
          participant: true,
        },
        orderBy: { registeredAt: "desc" },
      });

      this.render(res, "registrations/index", {
        registrations,
        pageName: "registrations",
      });
    });
  }
}
