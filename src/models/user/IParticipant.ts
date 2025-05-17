import { IUser } from "./IUser.js";
import { Event } from "../event/Event.js";
import { EventManager } from "../manager/EventManager.js";

export interface IParticipant extends IUser {
  registerForEvent(event: Event): Promise<boolean>;
  cancelRegistration(event: Event): Promise<boolean>;
  viewRegisteredEvents(eventManager: EventManager): Promise<Event[]>;
}
