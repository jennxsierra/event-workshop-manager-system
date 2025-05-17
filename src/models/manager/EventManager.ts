import { Event } from "../event/Event.js";
import { User } from "../user/User.js";
import { IEventManager } from "./IEventManager.js";
import { Role } from "../user/Role.js";
import prisma from "../../lib/prisma.js";
import { EventCategory } from "../event/EventCategory.js";

export class EventManager implements IEventManager {
  async createEvent(event: Event, currentUser: User): Promise<boolean> {
    try {
      if (![Role.STAFF, Role.ADMIN].includes(currentUser.role)) {
        throw new Error("Insufficient permissions to create events");
      }

      if (!currentUser.id) {
        throw new Error("User must have an ID to create events");
      }

      await prisma.event.create({
        data: {
          name: event.name,
          eventDate: event.date,
          startTime: event.time,
          endTime: event.endTime,
          location: event.location,
          category: event.category,
          capacity: event.capacity,
          createdById: currentUser.id,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to create event:", error);
      return false;
    }
  }

  async updateEvent(event: Event, currentUser: User): Promise<boolean> {
    try {
      if (![Role.STAFF, Role.ADMIN].includes(currentUser.role)) {
        throw new Error("Insufficient permissions to update events");
      }

      if (!currentUser.id || !event.id) {
        throw new Error("Both user and event must have IDs");
      }

      await prisma.event.update({
        where: { id: event.id },
        data: {
          name: event.name,
          eventDate: event.date,
          startTime: event.time,
          endTime: event.endTime,
          location: event.location,
          category: event.category,
          capacity: event.capacity,
          updatedById: currentUser.id,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to update event:", error);
      return false;
    }
  }

  async deleteEvent(event: Event, currentUser: User): Promise<boolean> {
    try {
      if (currentUser.role !== Role.ADMIN) {
        throw new Error("Only administrators can delete events");
      }

      if (!event.id) {
        throw new Error("Event must have an ID to be deleted");
      }

      await prisma.event.delete({
        where: { id: event.id },
      });

      return true;
    } catch (error) {
      console.error("Failed to delete event:", error);
      return false;
    }
  }

  async getEvents(): Promise<Event[]> {
    try {
      const prismaEvents = await prisma.event.findMany({
        orderBy: { eventDate: "asc" },
      });

      return prismaEvents.map(
        (e) =>
          new Event(
            e.name,
            e.eventDate,
            e.startTime,
            e.location,
            e.category as EventCategory,
            e.capacity,
            e.id,
            e.endTime || undefined
          )
      );
    } catch (error) {
      console.error("Failed to get events:", error);
      return [];
    }
  }

  async getEventsForParticipant(participantId: bigint): Promise<Event[]> {
    try {
      const registrations = await prisma.registration.findMany({
        where: {
          participantId,
          cancelled: false,
        },
        include: {
          event: true,
        },
      });

      return registrations.map(
        (r) =>
          new Event(
            r.event.name,
            r.event.eventDate,
            r.event.startTime,
            r.event.location,
            r.event.category as EventCategory,
            r.event.capacity,
            r.event.id,
            r.event.endTime || undefined
          )
      );
    } catch (error) {
      console.error("Failed to get events for participant:", error);
      return [];
    }
  }
}
