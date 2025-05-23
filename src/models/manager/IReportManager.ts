import { EventManager } from "./EventManager.js";

export interface IReportManager {
  eventManager: EventManager;

  generateSummaryReport(): Promise<any>;
  generateDetailedReport(filters?: { category?: string; startDate?: string; endDate?: string }): Promise<any>;
  generateHistoricalReport(): Promise<any>;
  generateSystemStats(): Promise<any>;
  
  // CSV export methods
  exportEventsToCSV(filters?: { category?: string; startDate?: string; endDate?: string }): Promise<string>;
  exportRegistrationsToCSV(filters?: { eventId?: string; status?: string }): Promise<string>;
  exportWorkshopsToCSV(filters?: { eventId?: string; published?: string }): Promise<string>;
  exportAttendanceToCSV(filters?: { category?: string; startDate?: string; endDate?: string }): Promise<string>;
}
