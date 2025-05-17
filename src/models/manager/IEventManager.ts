import { Event } from "../event/Event.js";
import { User } from "../user/User.js";

export interface IEventManager {
  createEvent(event: Event, currentUser: User): Promise<boolean>;
  updateEvent(event: Event, currentUser: User): Promise<boolean>;
  deleteEvent(event: Event, currentUser: User): Promise<boolean>;
  getEvents(): Promise<Event[]>;
  getEventsForParticipant(participantId: bigint): Promise<Event[]>;
}
