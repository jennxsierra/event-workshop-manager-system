import { IStaff } from "./IStaff.js";
import { IUser } from "./IUser.js";

export interface IAdministrator extends IStaff {
  updateUser(user: IUser): Promise<void>;
  generateReports(): Promise<void>;
}
