export interface IRegistration {
  id?: bigint;
  timestamp: Date;
  cancelled: boolean;
  cancelledAt?: Date;

  cancel(): void;
  isCancelled(): boolean;
}
