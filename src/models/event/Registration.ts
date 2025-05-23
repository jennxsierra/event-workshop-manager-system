import { IRegistration } from "./IRegistration.js";

export class Registration implements IRegistration {
  id?: bigint;
  timestamp: Date;
  cancelled: boolean;
  cancelledAt?: Date;
  attended: boolean;
  attendedAt?: Date;

  constructor(timestamp: Date = new Date(), id?: bigint) {
    this.timestamp = timestamp;
    this.cancelled = false;
    this.attended = false;
    this.id = id;
  }

  cancel(): void {
    this.cancelled = true;
    this.cancelledAt = new Date();
  }

  isCancelled(): boolean {
    return this.cancelled;
  }
  
  markAttended(): void {
    this.attended = true;
    this.attendedAt = new Date();
  }
  
  isAttended(): boolean {
    return this.attended;
  }
}
