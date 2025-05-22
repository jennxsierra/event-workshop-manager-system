import { User } from "./User.js";
import { IParticipant } from "./IParticipant.js";
import { Role } from "./Role.js";
import { Event } from "../event/Event.js";
import { EventManager } from "../manager/EventManager.js";
import prisma from "../../lib/prisma.js";

export class Participant extends User implements IParticipant {
  constructor(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    phone?: string,
    organization?: string,
    id?: bigint
  ) {
    super(
      username,
      firstName,
      lastName,
      email,
      Role.PARTICIPANT,
      phone,
      organization,
      id
    );
  }

  async registerForEvent(event: Event): Promise<boolean> {
    try {
      if (!this.id) {
        throw new Error(
          "User must be saved to database before registering for events"
        );
      }
      
      // Check if the event has already occurred
      const eventDate = new Date(event.date);
      const currentDate = new Date();
      if (eventDate < currentDate) {
        throw new Error("Cannot register for events that have already passed");
      }

      // Check if there's an existing registration (cancelled or not)
      const existingRegistration = await prisma.registration.findUnique({
        where: {
          eventId_participantId: {
            participantId: this.id,
            eventId: event.id as bigint,
          }
        }
      });

      if (existingRegistration && existingRegistration.cancelled) {
        // If registration exists but was cancelled, reactivate it
        await prisma.registration.update({
          where: { id: existingRegistration.id },
          data: {
            cancelled: false,
            cancelledAt: null,
            // Update registration date to now
            registeredAt: new Date()
          }
        });
      } else if (!existingRegistration) {
        // If no registration exists, create a new one
        await prisma.registration.create({
          data: {
            participantId: this.id,
            eventId: event.id as bigint,
          },
        });
      } else {
        // Registration exists and is active - nothing to do
        // This case should be handled by the controller before calling this method
      }

      return true;
    } catch (error) {
      console.error("Failed to register for event:", error);
      return false;
    }
  }

  async cancelRegistration(event: Event): Promise<boolean> {
    try {
      if (!this.id) {
        throw new Error("User must have an ID to cancel registration");
      }
      
      // Allow cancellation regardless of event date - users should be able to cancel
      // even if the event has passed, but this could be policy dependent
      
      await prisma.registration.updateMany({
        where: {
          participantId: this.id,
          eventId: event.id as bigint,
          cancelled: false,
        },
        data: {
          cancelled: true,
          cancelledAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to cancel registration:", error);
      return false;
    }
  }

  async viewRegisteredEvents(eventManager: EventManager): Promise<Event[]> {
    if (!this.id) {
      return [];
    }

    return await eventManager.getEventsForParticipant(this.id);
  }
}
