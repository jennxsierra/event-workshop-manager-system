import { Participant } from "./Participant.js";
import { IStaff } from "./IStaff.js";
import { Role } from "./Role.js";
import { Event } from "../event/Event.js";
import prisma from "../../lib/prisma.js";

export class Staff extends Participant implements IStaff {
  constructor(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    phone?: string,
    organization?: string,
    id?: bigint
  ) {
    super(username, firstName, lastName, email, phone, organization, id);
    this.role = Role.STAFF;
  }

  async updateEvent(event: Event): Promise<void> {
    try {
      if (!this.id) {
        throw new Error(
          "Staff must be saved to database before updating events"
        );
      }

      if (!event.id) {
        throw new Error("Event must have an ID to be updated");
      }

      await prisma.event.update({
        where: {
          id: event.id as bigint,
        },
        data: {
          name: event.name,
          eventDate: event.date,
          startTime: event.time,
          endTime: event.endTime,
          location: event.location,
          category: event.category,
          capacity: event.capacity,
          updatedById: this.id,
        },
      });
    } catch (error) {
      console.error("Failed to update event:", error);
      throw error;
    }
  }
}
