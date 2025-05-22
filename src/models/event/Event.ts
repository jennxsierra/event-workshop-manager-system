import { EventCategory } from "./EventCategory.js";
import { Registration } from "./Registration.js";
import { IEvent } from "./IEvent.js";

export class Event implements IEvent {
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

  constructor(
    name: string,
    date: Date,
    time: Date,
    location: string,
    category: EventCategory,
    capacity: number,
    id?: bigint,
    endTime?: Date,
    description?: string
  ) {
    this.name = name;
    this.date = date;
    this.time = time;
    this.location = location;
    this.category = category;
    this.capacity = capacity;
    this.id = id;
    this.endTime = endTime;
    this.description = description;
    this.registrations = [];
  }

  addRegistration(registration: Registration): void {
    if (this.registrations.length >= this.capacity) {
      throw new Error("Event is at capacity");
    }

    this.registrations.push(registration);
  }

  removeRegistration(registration: Registration): void {
    const index = this.registrations.findIndex((r) => r.id === registration.id);

    if (index !== -1) {
      this.registrations.splice(index, 1);
    }
  }
  
  // Get the number of valid registrations
  getRegistrationCount(): number {
    if (!this.registrations) return 0;
    return this.registrations.filter(r => !r.cancelled).length;
  }
}
