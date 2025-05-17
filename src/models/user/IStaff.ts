import { IParticipant } from "./IParticipant.js";
import { Event } from "../event/Event.js";

export interface IStaff extends IParticipant {
  updateEvent(event: Event): Promise<void>;
}
