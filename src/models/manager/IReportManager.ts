import { EventManager } from "./EventManager.js";

export interface IReportManager {
  eventManager: EventManager;

  generateSummaryReport(): Promise<any>;
  generateDetailedReport(filters?: { category?: string; startDate?: string; endDate?: string }): Promise<any>;
  generateHistoricalReport(): Promise<any>;
  generateSystemStats(): Promise<any>;
}
