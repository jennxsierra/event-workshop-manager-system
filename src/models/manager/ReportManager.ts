import { EventManager } from "./EventManager.js";
import { IReportManager } from "./IReportManager.js";
import prisma from "../../lib/prisma.js";

export class ReportManager implements IReportManager {
  eventManager: EventManager;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
  }

  async generateSummaryReport(): Promise<any> {
    try {
      const today = new Date();
      
      // Get total events count
      const totalEvents = await prisma.event.count();
      
      // Get upcoming events count
      const upcomingEvents = await prisma.event.count({
        where: {
          eventDate: {
            gt: today
          }
        }
      });
      
      // Get past events count
      const pastEvents = await prisma.event.count({
        where: {
          eventDate: {
            lt: today
          }
        }
      });

      // Get registration statistics
      const totalRegistrations = await prisma.registration.count();
      const activeRegistrations = await prisma.registration.count({
        where: { cancelled: false },
      });

      // Get participant statistics
      const totalParticipants = await prisma.user.count({
        where: { role: "PARTICIPANT" },
      });
      
      // Calculate average registrations per event
      const avgRegistrations = totalEvents > 0 ? totalRegistrations / totalEvents : 0;
      
      // Get event data for the performance summary table
      const events = await prisma.event.findMany({
        include: {
          registrations: true,
        },
        orderBy: {
          eventDate: 'desc'
        },
        take: 20, // Limit to most recent 20 events
      });
      
      // Format event data for the table
      const eventData = events.map((event) => {
        const activeRegs = event.registrations.filter(reg => !reg.cancelled).length;
        const attended = event.registrations.filter(reg => reg.attended === true).length;
        
        return {
          id: event.id,
          name: event.name,
          date: event.eventDate,
          category: event.category,
          registrationCount: activeRegs,
          capacity: event.capacity,
          attendedCount: attended
        };
      });

      // Generate the summary report
      return {
        totalEvents,
        upcomingEvents,
        pastEvents,
        registrationStats: {
          total: totalRegistrations,
          active: activeRegistrations,
          cancelled: totalRegistrations - activeRegistrations,
        },
        avgRegistrations,
        totalParticipants,
        eventData,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate summary report:", error);
      throw error;
    }
  }

  async generateDetailedReport(filters?: { category?: string; startDate?: string; endDate?: string }): Promise<any> {
    try {
      // Build where clause based on filters
      const whereClause: any = {};
      
      if (filters?.category) {
        whereClause.category = filters.category;
      }
      
      // Add date filters if provided
      if (filters?.startDate) {
        whereClause.eventDate = {
          ...(whereClause.eventDate || {}),
          gte: new Date(filters.startDate)
        };
      }
      
      if (filters?.endDate) {
        whereClause.eventDate = {
          ...(whereClause.eventDate || {}),
          lte: new Date(filters.endDate)
        };
      }
      
      // Get events with registration counts - include all registrations, not just non-cancelled ones
      const events = await prisma.event.findMany({
        where: whereClause,
        include: {
          registrations: true, // Include all registrations to calculate different metrics
        },
        orderBy: {
          eventDate: 'desc' // Sort by most recent first
        }
      });

      // Compute statistics
      const totalRegistrations = events.reduce((sum, event) => sum + event.registrations.length, 0);
      const attendedCount = events.reduce((sum, event) => {
        return sum + event.registrations.filter(reg => reg.attended === true).length;
      }, 0);
      const cancelledCount = events.reduce((sum, event) => {
        return sum + event.registrations.filter(reg => reg.cancelled === true).length;
      }, 0);
      const attendanceRate = totalRegistrations > 0 ? 
        (attendedCount / (totalRegistrations - cancelledCount)) * 100 : 0;
      
      // Format event data for the table
      const attendanceData = events.map((event) => {
        const totalRegs = event.registrations.length;
        const attended = event.registrations.filter(reg => reg.attended === true).length;
        const cancelled = event.registrations.filter(reg => reg.cancelled === true).length;
        
        return {
          id: event.id,
          name: event.name,
          date: event.eventDate,
          category: event.category,
          totalRegistrations: totalRegs,
          attendedCount: attended,
          cancelledCount: cancelled
        };
      });

      return {
        events: attendanceData,
        attendanceData, // Add this for template compatibility
        totalRegistrations,
        attendedCount,
        cancelledCount,
        attendanceRate,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate detailed report:", error);
      throw error;
    }
  }

  async generateHistoricalReport(): Promise<any> {
    try {
      // Get historical data by month
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const events = await prisma.event.findMany({
        where: {
          eventDate: {
            gte: sixMonthsAgo,
          },
        },
        orderBy: {
          eventDate: "asc",
        },
        include: {
          registrations: true,
        },
      });

      // Process data by month
      const monthlyData: Record<string, any> = {};

      events.forEach((event) => {
        const monthYear = `${
          event.eventDate.getMonth() + 1
        }/${event.eventDate.getFullYear()}`;

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            eventCount: 0,
            registrationCount: 0,
            cancellationCount: 0,
          };
        }

        monthlyData[monthYear].eventCount++;
        monthlyData[monthYear].registrationCount += event.registrations.length;
        monthlyData[monthYear].cancellationCount += event.registrations.filter(
          (r) => r.cancelled
        ).length;
      });

      return {
        monthlyData,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate historical report:", error);
      throw error;
    }
  }
  
  async generateSystemStats(): Promise<any> {
    try {
      // Get total events
      const totalEvents = await prisma.event.count();
      
      // Get total registrations
      const totalRegistrations = await prisma.registration.count();
      
      // Get total users
      const totalUsers = await prisma.user.count();
      
      return {
        totalEvents,
        totalRegistrations,
        totalUsers,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate system stats:", error);
      throw error;
    }
  }

  /**
   * Export events data to CSV format
   * @param filters Optional filters for events
   * @returns CSV formatted string
   */
  async exportEventsToCSV(filters?: { category?: string; startDate?: string; endDate?: string }): Promise<string> {
    try {
      // Build where clause based on filters
      const whereClause: any = {};
      
      if (filters?.category) {
        whereClause.category = filters.category;
      }
      
      // Add date filters if provided
      if (filters?.startDate) {
        whereClause.eventDate = {
          ...(whereClause.eventDate || {}),
          gte: new Date(filters.startDate)
        };
      }
      
      if (filters?.endDate) {
        whereClause.eventDate = {
          ...(whereClause.eventDate || {}),
          lte: new Date(filters.endDate)
        };
      }
      
      // Get events with registration counts
      const events = await prisma.event.findMany({
        where: whereClause,
        include: {
          registrations: true,
        },
        orderBy: {
          eventDate: 'desc'
        }
      });

      // Format data for CSV
      let csv = "ID,Name,Date,Category,Description,Location,Capacity,Registrations,Attended,Cancelled\n";
      
      events.forEach(event => {
        const totalRegistrations = event.registrations.length;
        const attended = event.registrations.filter(reg => reg.attended === true).length;
        const cancelled = event.registrations.filter(reg => reg.cancelled === true).length;
        
        // Format date as YYYY-MM-DD
        const formattedDate = event.eventDate.toISOString().split('T')[0];
        
        // Escape any commas in text fields
        const escapedName = `"${event.name.replace(/"/g, '""')}"`;
        const escapedDescription = `"${event.description ? event.description.replace(/"/g, '""') : ''}"`;
        const escapedLocation = `"${event.location ? event.location.replace(/"/g, '""') : ''}"`;
        
        csv += `${event.id},${escapedName},${formattedDate},${event.category},${escapedDescription},${escapedLocation},${event.capacity},${totalRegistrations},${attended},${cancelled}\n`;
      });
      
      return csv;
    } catch (error) {
      console.error("Failed to export events to CSV:", error);
      throw error;
    }
  }

  /**
   * Export registrations data to CSV format
   * @param filters Optional filters for registrations
   * @returns CSV formatted string
   */
  async exportRegistrationsToCSV(filters?: { eventId?: string; status?: string }): Promise<string> {
    try {
      // Build where clause based on filters
      const whereClause: any = {};
      
      if (filters?.eventId) {
        whereClause.eventId = BigInt(filters.eventId);
      }
      
      if (filters?.status === 'active') {
        whereClause.cancelled = false;
      } else if (filters?.status === 'cancelled') {
        whereClause.cancelled = true;
      } else if (filters?.status === 'attended') {
        whereClause.attended = true;
      }
      
      // Get registrations with related event and participant data
      const registrations = await prisma.registration.findMany({
        where: whereClause,
        include: {
          event: true,
          participant: true
        },
        orderBy: [
          { eventId: 'asc' },
          { registeredAt: 'desc' }
        ]
      });

      // Format data for CSV
      let csv = "ID,Event ID,Event Name,User ID,User Name,User Email,Registration Date,Status,Attended\n";
      
      registrations.forEach(reg => {
        // Format date as YYYY-MM-DD
        const formattedDate = reg.registeredAt.toISOString().split('T')[0];
        
        // Get status - show as Cancelled, Attended, or Registered
        let status;
        if (reg.cancelled) {
          status = 'Cancelled';
        } else if (reg.attended) {
          status = 'Attended';
        } else {
          status = 'Registered';
        }
        
        // Only include participant data if available
        let participantName = 'N/A';
        let participantEmail = 'N/A';
        const participantId = reg.participant ? reg.participantId : 'N/A';
        
        if (reg.participant) {
          // Properly format and escape names and emails
          const fullName = `${reg.participant.firstName} ${reg.participant.lastName}`;
          participantName = `"${fullName.replace(/"/g, '""')}"`;
          participantEmail = `"${reg.participant.email.replace(/"/g, '""')}"`;
        }
        
        // Escape any commas in text fields
        const escapedEventName = `"${reg.event.name.replace(/"/g, '""')}"`;
        
        csv += `${reg.id},${reg.eventId},${escapedEventName},${participantId},${participantName},${participantEmail},${formattedDate},${status},${reg.attended ? 'Yes' : 'No'}\n`;
      });
      
      return csv;
    } catch (error) {
      console.error("Failed to export registrations to CSV:", error);
      throw error;
    }
  }

  /**
   * Export workshops data to CSV format
   * @param filters Optional filters for workshops
   * @returns CSV formatted string
   */
  async exportWorkshopsToCSV(filters?: { eventId?: string; published?: string }): Promise<string> {
    try {
      // Build where clause based on filters
      const whereClause: any = {};
      
      if (filters?.eventId) {
        whereClause.id = BigInt(filters.eventId);
      }
      
      // Get workshops (events with category = WORKSHOP)
      const workshops = await prisma.event.findMany({
        where: {
          ...whereClause,
          category: 'WORKSHOP'
        },
        include: {
          registrations: true,
          createdBy: true
        },
        orderBy: {
          eventDate: 'desc'
        }
      });

      // Format data for CSV
      let csv = "ID,Name,Date,StartTime,Location,Capacity,Registrations,Attendance Rate,Created By,Description\n";
      
      workshops.forEach(workshop => {
        const totalRegistrations = workshop.registrations.length;
        const activeRegistrations = workshop.registrations.filter(reg => !reg.cancelled).length;
        const attended = workshop.registrations.filter(reg => reg.attended === true).length;
        const attendanceRate = activeRegistrations > 0 ? ((attended / activeRegistrations) * 100).toFixed(1) + '%' : '0%';
        
        // Format date as YYYY-MM-DD
        const formattedDate = workshop.eventDate.toISOString().split('T')[0];
        
        // Format time as HH:MM
        const formattedTime = workshop.startTime.toTimeString().split(' ')[0].substring(0, 5);
        
        // Get creator name if available
        const createdByName = workshop.createdBy ? 
          `${workshop.createdBy.firstName} ${workshop.createdBy.lastName}` : 'System';
        
        // Escape any commas in text fields
        const escapedName = `"${workshop.name.replace(/"/g, '""')}"`;
        const escapedLocation = `"${workshop.location.replace(/"/g, '""')}"`;
        const escapedDescription = `"${workshop.description ? workshop.description.replace(/"/g, '""') : ''}"`;
        const escapedCreatedBy = `"${createdByName.replace(/"/g, '""')}"`;
        
        csv += `${workshop.id},${escapedName},${formattedDate},${formattedTime},${escapedLocation},${workshop.capacity},${totalRegistrations},${attendanceRate},${escapedCreatedBy},${escapedDescription}\n`;
      });
      
      return csv;
    } catch (error) {
      console.error("Failed to export workshops to CSV:", error);
      throw error;
    }
  }

  /**
   * Export attendance data to CSV format
   * @param filters Optional filters for attendance data
   * @returns CSV formatted string
   */
  async exportAttendanceToCSV(filters?: { category?: string; startDate?: string; endDate?: string }): Promise<string> {
    try {
      // Use the same filter logic as detailed report
      const result = await this.generateDetailedReport(filters);
      const attendanceData = result.attendanceData || [];
      
      // Format data for CSV
      let csv = "Event ID,Event Name,Date,Category,Total Registrations,Attended,Cancelled,Attendance Rate\n";
      
      attendanceData.forEach((event: { 
        id: number | bigint;
        name: string;
        date: Date | string;
        category: string;
        totalRegistrations: number;
        attendedCount: number;
        cancelledCount: number;
      }) => {
        const totalRegs = event.totalRegistrations;
        const activeRegs = totalRegs - event.cancelledCount;
        const attendanceRate = activeRegs > 0 ? ((event.attendedCount / activeRegs) * 100).toFixed(1) + '%' : '0%';
        
        // Format date as YYYY-MM-DD
        const formattedDate = new Date(event.date).toISOString().split('T')[0];
        
        // Escape any commas in text fields
        const escapedName = `"${event.name.replace(/"/g, '""')}"`;
        
        csv += `${event.id},${escapedName},${formattedDate},${event.category},${totalRegs},${event.attendedCount},${event.cancelledCount},${attendanceRate}\n`;
      });
      
      return csv;
    } catch (error) {
      console.error("Failed to export attendance data to CSV:", error);
      throw error;
    }
  }
}
