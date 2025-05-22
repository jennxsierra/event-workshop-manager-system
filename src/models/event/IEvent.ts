import { EventCategory } from "./EventCategory.js";
import { Registration } from "./Registration.js";

export interface IEvent {
  id?: bigint;
  name: string;
  description?: string;
  date: Date;
  time: Date;
  endTime?: Date;
  location: string;
  category: EventCategory;
  capacity: number;
  registrations: Registration[];

  addRegistration(registration: Registration): void;
  removeRegistration(registration: Registration): void;
}
