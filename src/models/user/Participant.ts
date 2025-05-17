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

      await prisma.registration.create({
        data: {
          participantId: this.id,
          eventId: event.id as bigint,
        },
      });

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
