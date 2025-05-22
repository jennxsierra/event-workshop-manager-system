import { Event } from "../event/Event.js";
import { Registration } from "../event/Registration.js";
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
          description: event.description,
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
          description: event.description,
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

  async getEvents(filters?: { category?: string; date?: string }): Promise<Event[]> {
    try {
      // Prepare where conditions for filtering
      const where: any = {};
      
      // Apply category filter if provided
      if (filters?.category) {
        where.category = filters.category;
      }
      
      // Apply date filter if provided
      if (filters?.date) {
        // Handle different date formats
        let filterDate;
        
        try {
          console.log("Date filter received:", filters.date);
          
          // Try to parse the date - handle both ISO format and yyyy-mm-dd
          if (filters.date.includes('-')) {
            // Standard date format like "2025-07-06"
            const parts = filters.date.split('-');
            if (parts.length === 3) {
              // Ensure we're using year-month-day format properly
              filterDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
          } else if (filters.date.includes('/')) {
            // Handle date format mm/dd/yyyy
            const parts = filters.date.split('/');
            if (parts.length === 3) {
              filterDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
            }
          }
          
          // If date parsing failed, try fallback
          if (!filterDate || isNaN(filterDate.getTime())) {
            filterDate = new Date(filters.date);
          }
          
          // Only add date filter if it's a valid date
          if (!isNaN(filterDate.getTime())) {
            console.log("Filtering by date:", filterDate);
            
            // Set the time to midnight to compare only the date part
            filterDate.setHours(0, 0, 0, 0);
            
            // Get the next day for date range comparison
            const nextDay = new Date(filterDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            where.eventDate = {
              gte: filterDate,
              lt: nextDay,
            };
          }
        } catch (error) {
          console.error("Error parsing date filter:", error);
        }
      }
      
      const prismaEvents = await prisma.event.findMany({
        where,
        orderBy: { eventDate: "asc" },
        include: { registrations: { where: { cancelled: false } } }, // Include only active registrations
      });

      return prismaEvents.map(
        (e) => {
          const event = new Event(
            e.name,
            e.eventDate,
            e.startTime,
            e.location,
            e.category as EventCategory,
            e.capacity,
            e.id,
            e.endTime || undefined,
            e.description || undefined
          );
          
          // Convert database registration objects to Registration instances
          if (e.registrations && Array.isArray(e.registrations)) {
            // Convert each DB registration to a proper Registration instance
            e.registrations.forEach(dbReg => {
              const registration = new Registration(dbReg.registeredAt, dbReg.id);
              if (dbReg.cancelled) {
                registration.cancel();
                if (dbReg.cancelledAt) {
                  registration.cancelledAt = dbReg.cancelledAt;
                }
              }
              event.addRegistration(registration);
            });
          }
          
          return event;
        }
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
