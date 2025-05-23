export interface IRegistration {
  id?: bigint;
  timestamp: Date;
  cancelled: boolean;
  cancelledAt?: Date;
  attended: boolean;
  attendedAt?: Date;

  cancel(): void;
  isCancelled(): boolean;
  markAttended(): void;
  isAttended(): boolean;
}
