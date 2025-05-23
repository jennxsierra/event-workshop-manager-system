import { EventManager } from "./EventManager.js";

export interface IReportManager {
  eventManager: EventManager;

  generateSummaryReport(): Promise<any>;
  generateDetailedReport(): Promise<any>;
  generateHistoricalReport(): Promise<any>;
  generateSystemStats(): Promise<any>;
}
