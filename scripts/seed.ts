import { PrismaClient, Role, EventCategory } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Helper function to set a specific time on a date
 * @param date Base date object
 * @param hours Hours (0-23)
 * @param minutes Minutes (0-59)
 * @returns Date with the specified time
 */
function setTime(date: Date, hours: number, minutes: number): Date {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

/**
 * Comprehensive database seed script for demonstration purposes.
 * This sets up:
 * - Admin, Staff and Participant users
 * - Various events across all categories
 * - Sample registrations
 *
 * Note: This script will reset the database each time it runs
 */
async function main() {
  console.log("Starting database seed process...");

  // Reset the database
  await resetDatabase();

  // Create users (admins, staff, participants)
  const users = await createUsers();

  // Create events across all categories
  const events = await createEvents(users.staffUsers[0].id);

  // Create registrations
  await createRegistrations(events, users.participantUsers);

  console.log("Seed completed successfully!");
}

/**
 * Reset the database by deleting all records
 */
async function resetDatabase() {
  console.log("Resetting database...");

  // Delete in reverse order to respect foreign key constraints
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database reset completed");
}

/**
 * Create admin, staff and participant users
 */
async function createUsers() {
  console.log("Creating users...");

  // Create admin users
  const adminUsers = await Promise.all([
    createUser(
      "admin",
      "admin123",
      "System",
      "Administrator",
      "admin@example.com",
      Role.ADMIN
    ),
    createUser(
      "johndoe",
      "password123",
      "John",
      "Doe",
      "john.doe@example.com",
      Role.ADMIN
    ),
  ]);

  // Create staff users
  const staffUsers = await Promise.all([
    createUser(
      "janesmith",
      "password123",
      "Jane",
      "Smith",
      "jane.smith@example.com",
      Role.STAFF
    ),
    createUser(
      "michaelb",
      "password123",
      "Michael",
      "Brown",
      "michael.brown@example.com",
      Role.STAFF
    ),
    createUser(
      "laurat",
      "password123",
      "Laura",
      "Taylor",
      "laura.taylor@example.com",
      Role.STAFF
    ),
  ]);

  // Create participant users
  const participantUsers = await Promise.all([
    createUser(
      "samwilson",
      "password123",
      "Sam",
      "Wilson",
      "sam.wilson@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "emilyd",
      "password123",
      "Emily",
      "Davis",
      "emily.davis@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "robertj",
      "password123",
      "Robert",
      "Johnson",
      "robert.johnson@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "oliviaw",
      "password123",
      "Olivia",
      "White",
      "olivia.white@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "thomasm",
      "password123",
      "Thomas",
      "Miller",
      "thomas.miller@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "sophiab",
      "password123",
      "Sophia",
      "Baker",
      "sophia.baker@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "williamm",
      "password123",
      "William",
      "Moore",
      "william.moore@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "emmat",
      "password123",
      "Emma",
      "Taylor",
      "emma.taylor@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "jamesd",
      "password123",
      "James",
      "Davis",
      "james.davis@example.com",
      Role.PARTICIPANT
    ),
    createUser(
      "averya",
      "password123",
      "Avery",
      "Anderson",
      "avery.anderson@example.com",
      Role.PARTICIPANT
    ),
  ]);

  console.log(
    `Created ${adminUsers.length} admin users, ${staffUsers.length} staff users, and ${participantUsers.length} participants`
  );

  return {
    adminUsers,
    staffUsers,
    participantUsers,
  };
}

/**
 * Helper function to create a single user
 */
async function createUser(
  username: string,
  password: string,
  firstName: string,
  lastName: string,
  email: string,
  role: Role
) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      username,
      passwordHash,
      firstName,
      lastName,
      email,
      role,
      phone:
        "+1" + Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
      organization:
        role !== Role.PARTICIPANT
          ? "Event Workshop Management System"
          : [
              "ABC Corporation",
              "XYZ Inc",
              "Acme Co",
              "TechStart",
              "Global Services",
              "Local Business",
            ][Math.floor(Math.random() * 6)],
    },
  });
}

/**
 * Create events across all categories
 */
async function createEvents(creatorId: bigint) {
  console.log("Creating events across all categories...");

  // Generate dates for events
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const twoMonthsLater = new Date(today);
  twoMonthsLater.setMonth(today.getMonth() + 2);

  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  // Create workshops
  const workshops = await Promise.all([
    createEvent({
      name: "GIS for Statistical Analysis Workshop",
      category: EventCategory.WORKSHOP,
      eventDate: nextWeek,
      startTime: setTime(nextWeek, 9, 0), // 9:00 AM
      endTime: setTime(nextWeek, 17, 0), // 5:00 PM (all-day event)
      location: "SIB Training Room, 1902 Constitution Drive, Belmopan",
      capacity: 30,
      createdById: creatorId,
      description:
        "This comprehensive full-day workshop will introduce participants to Geographic Information Systems (GIS) techniques for enhancing statistical processes. Participants will learn how to visualize statistical data geographically, conduct spatial analysis, and create interactive maps for data presentation. All equipment and materials will be provided, with lunch included for all attendees.",
    }),
    createEvent({
      name: "Data Visualization Techniques Workshop",
      category: EventCategory.WORKSHOP,
      eventDate: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks after next week
      startTime: setTime(
        new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000),
        9,
        30
      ), // 9:30 AM
      endTime: setTime(
        new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000),
        12,
        30
      ), // 12:30 PM
      location: "University of Belize, Belmopan Campus",
      capacity: 40,
      createdById: creatorId,
      description:
        "Learn effective techniques for visualizing complex statistical data in this half-day workshop conducted by the Statistical Institute of Belize. The session will cover principles of data visualization, tools for creating compelling charts and infographics, and best practices for presenting statistical information to various audiences. Aimed at researchers, students, and professionals who work with data.",
    }),
  ]);

  // Create training events
  const training = await Promise.all([
    createEvent({
      name: "Census Data Collection Training",
      category: EventCategory.TRAINING,
      eventDate: new Date(nextWeek.getTime() + 10 * 24 * 60 * 60 * 1000),
      startTime: setTime(
        new Date(nextWeek.getTime() + 10 * 24 * 60 * 60 * 1000),
        8,
        30
      ), // 8:30 AM
      endTime: setTime(
        new Date(nextWeek.getTime() + 10 * 24 * 60 * 60 * 1000),
        16,
        30
      ), // 4:30 PM
      location: "Best Western Plus Belize Biltmore Plaza, Belize City",
      capacity: 50,
      createdById: creatorId,
      description:
        "Comprehensive training program for census enumerators covering data collection methodologies, interview techniques, and the use of digital collection tools. This training is mandatory for all personnel who will be participating in the upcoming national census. The session includes hands-on practice with survey instruments, role-playing exercises, and protocols for handling challenging field situations.",
    }),
    createEvent({
      name: "Statistical Analysis with SPSS Certification",
      category: EventCategory.TRAINING,
      eventDate: new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
      // All day event (9:00 AM to 5:00 PM)
      startTime: setTime(
        new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
        9,
        0
      ),
      endTime: setTime(
        new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
        17,
        0
      ),
      location: "SIB Computer Lab, Belmopan",
      capacity: 25,
      createdById: creatorId,
      description:
        "This comprehensive three-day certification program provides in-depth training on using SPSS for statistical analysis of survey data. Participants will learn data preparation techniques, descriptive statistics, hypothesis testing, regression analysis, and advanced statistical methods. The course is designed for researchers, analysts, and government officials who work with statistical data. Certification will be issued upon successful completion of the course assessment.",
    }),
  ]);

  // Create public outreach events
  const publicEvents = await Promise.all([
    createEvent({
      name: "Belize National Statistics Day Expo",
      category: EventCategory.PUBLIC_OUTREACH,
      eventDate: nextMonth,
      // All day event (9:00 AM to 3:00 PM)
      startTime: setTime(nextMonth, 9, 0), // 9:00 AM
      endTime: setTime(nextMonth, 15, 0), // 3:00 PM
      location: "BTL Park, Belize City",
      capacity: 200,
      createdById: creatorId,
      description:
        "Join the Statistical Institute of Belize for National Statistics Day! This free public event showcases how statistics impact everyday life in Belize. Interactive booths will demonstrate various aspects of economic, demographic, and social statistics. Attendees can participate in data collection demonstrations, view informative displays, and learn about career opportunities in statistics. Special activities for students and refreshments will be provided.",
    }),
    createEvent({
      name: "Understanding Inflation: Community Information Session",
      category: EventCategory.PUBLIC_OUTREACH,
      eventDate: new Date(nextWeek.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks after next week
      startTime: setTime(
        new Date(nextWeek.getTime() + 21 * 24 * 60 * 60 * 1000),
        14,
        0
      ), // 2:00 PM
      endTime: setTime(
        new Date(nextWeek.getTime() + 21 * 24 * 60 * 60 * 1000),
        16,
        0
      ), // 4:00 PM
      location: "San Pedro Town Hall, Ambergris Caye",
      capacity: 60,
      createdById: creatorId,
      description:
        "The Statistical Institute of Belize invites residents to attend this informative session on understanding inflation and the Consumer Price Index. Learn how inflation is measured, what causes prices to rise, and how to interpret the monthly CPI reports. SIB experts will explain how inflation affects households and businesses in Belize and answer questions from attendees. Free educational materials will be provided to all participants.",
    }),
  ]);

  // Create press events
  const pressEvents = await Promise.all([
    createEvent({
      name: "Q2 Economic Statistics Media Briefing",
      category: EventCategory.PRESS,
      eventDate: nextWeek,
      startTime: setTime(nextWeek, 10, 0), // 10:00 AM
      endTime: setTime(nextWeek, 12, 0), // 12:00 PM
      location: "SIB Conference Room, 1902 Constitution Drive, Belmopan",
      capacity: 30,
      createdById: creatorId,
      description:
        "The Statistical Institute of Belize presents its quarterly economic statistics briefing for the media. This session will cover the latest GDP figures, Consumer Price Index data, External Trade statistics, and Labor Force Survey results. The Director General and department heads will present key findings, followed by a Q&A session with journalists. Press credentials required for entry.",
    }),
    createEvent({
      name: "Annual Statistical Report Press Conference",
      category: EventCategory.PRESS,
      eventDate: new Date(twoMonthsLater.getTime() + 15 * 24 * 60 * 60 * 1000),
      startTime: setTime(
        new Date(twoMonthsLater.getTime() + 15 * 24 * 60 * 60 * 1000),
        10,
        30
      ), // 10:30 AM
      endTime: setTime(
        new Date(twoMonthsLater.getTime() + 15 * 24 * 60 * 60 * 1000),
        12,
        30
      ), // 12:30 PM
      location: "Radisson Fort George Hotel, Belize City",
      capacity: 50,
      createdById: creatorId,
      description:
        "The Statistical Institute of Belize presents its comprehensive Annual Statistical Report, providing a detailed analysis of economic, social, and demographic trends in Belize. Key findings from the Abstract of Statistics will be highlighted, with special focus on year-over-year changes and long-term patterns. Media kit with full statistical tables and infographics will be provided to all attendees. Press credentials required.",
    }),
  ]);

  // Create launch events
  const launchEvents = await Promise.all([
    createEvent({
      name: "Census 2025 Launch Event",
      category: EventCategory.LAUNCH,
      eventDate: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      startTime: setTime(
        new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
        10,
        0
      ), // 10:00 AM
      endTime: setTime(
        new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
        13,
        0
      ), // 1:00 PM
      location: "Belize Civic Center, Belize City",
      capacity: 150,
      createdById: creatorId,
      description:
        "The Statistical Institute of Belize officially launches the 2025 Population and Housing Census campaign. This event will introduce the census methodology, timeline, and public awareness activities. Government officials, community leaders, and international partners will attend this important milestone in Belize's statistical development. The event includes demonstrations of the digital census tools, a panel discussion on data privacy, and the unveiling of the census theme and logo.",
    }),
    createEvent({
      name: "SIB Data Portal Launch",
      category: EventCategory.LAUNCH,
      eventDate: new Date(twoMonthsLater.getTime()),
      // All-day event
      startTime: setTime(new Date(twoMonthsLater.getTime()), 9, 0), // 9:00 AM
      endTime: setTime(new Date(twoMonthsLater.getTime()), 17, 0), // 5:00 PM
      location: "Biltmore Plaza Hotel, Belize City",
      capacity: 80,
      createdById: creatorId,
      description:
        "Join the Statistical Institute of Belize for the official launch of our new integrated Data Portal. This revolutionary platform provides public access to Belize's official statistics through interactive dashboards, downloadable datasets, and customizable reports. The all-day event includes technical demonstrations, user workshops, and presentations on data-driven decision making. Representatives from government ministries, educational institutions, and international organizations are invited to attend.",
    }),
  ]);

  // Past events for reporting
  const pastEvents = await Promise.all([
    createEvent({
      name: "REDATAM Data Analysis Workshop",
      category: EventCategory.WORKSHOP,
      eventDate: lastMonth,
      // All-day event
      startTime: setTime(lastMonth, 9, 0), // 9:00 AM
      endTime: setTime(lastMonth, 17, 0), // 5:00 PM
      location: "SIB Computer Lab, 1902 Constitution Drive, Belmopan",
      capacity: 25,
      createdById: creatorId,
      description:
        "This intensive workshop provided training on using REDATAM software for census data processing and analysis. Participants learned techniques for creating customized tabulations, generating statistical indicators, and performing area-specific analysis using 2022 census data. The workshop was attended by government statisticians, academic researchers, and NGO data analysts working with Belize's demographic data.",
    }),
    createEvent({
      name: "Statistical Literacy in Schools Program",
      category: EventCategory.PUBLIC_OUTREACH,
      eventDate: lastWeek,
      startTime: setTime(lastWeek, 9, 30), // 9:30 AM (half hour increment)
      endTime: setTime(lastWeek, 14, 30), // 2:30 PM (half hour increment)
      location: "Edward P. Yorke High School, Belize City",
      capacity: 100,
      createdById: creatorId,
      description:
        "The Statistical Institute of Belize organized this educational outreach event to promote statistical literacy among secondary school students. SIB staff conducted interactive sessions on understanding graphs, interpreting data, and recognizing the importance of statistics in everyday decision-making. The event featured data visualization competitions, career talks on opportunities in statistics, and distribution of educational materials developed specifically for young learners.",
    }),
    createEvent({
      name: "Multiple Indicator Cluster Survey 7 Results Launch",
      category: EventCategory.LAUNCH,
      eventDate: new Date(today.getFullYear() - 1, 11, 10), // Last year Dec 10
      startTime: setTime(new Date(today.getFullYear() - 1, 11, 10), 9, 0), // 9:00 AM
      endTime: setTime(new Date(today.getFullYear() - 1, 11, 10), 12, 0), // 12:00 PM
      location: "Ramada Princess Hotel, Belize City",
      capacity: 120,
      createdById: creatorId,
      description:
        "The Statistical Institute of Belize, in collaboration with UNICEF, presented the key findings from the Multiple Indicator Cluster Survey 7 (MICS7). This international household survey collected data on health, education, child protection, and welfare indicators in Belize. Government officials, development partners, and civil society representatives attended this important data release event, which included presentations on methodology, key findings, and implications for policy development and monitoring of the Sustainable Development Goals.",
    }),
  ]);

  const allEvents = [
    ...workshops,
    ...training,
    ...publicEvents,
    ...pressEvents,
    ...launchEvents,
    ...pastEvents,
  ];
  console.log(`Created ${allEvents.length} events`);

  return allEvents;
}

/**
 * Helper function to create a single event
 */
async function createEvent(eventData: {
  name: string;
  category: EventCategory;
  eventDate: Date;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  createdById: bigint;
  description?: string;
}) {
  return prisma.event.create({
    data: {
      name: eventData.name,
      category: eventData.category,
      eventDate: eventData.eventDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      capacity: eventData.capacity,
      createdById: eventData.createdById,
      description: eventData.description,
    },
  });
}

/**
 * Create registrations for events
 */
async function createRegistrations(events: any[], participants: any[]) {
  console.log("Creating registrations...");

  const registrationPromises: Promise<any>[] = [];
  const registrationCount: { [key: string]: number } = {};
  const today = new Date();

  // Create registrations with a mix of statuses
  for (const event of events) {
    // Past events should have completed registrations
    const isPastEvent = event.eventDate < today;

    // Select a random number of participants for this event (between 40-90% of capacity)
    const count = Math.floor(event.capacity * (Math.random() * 0.5 + 0.4));
    registrationCount[event.id] = count;

    // Select random participants
    const selectedParticipants = participants
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(count, participants.length));

    for (let i = 0; i < selectedParticipants.length; i++) {
      const participant = selectedParticipants[i];

      // CRITICAL FIX: Always ensure registrations happen BEFORE the event date
      const eventDate = new Date(event.eventDate);

      // Calculate the day before the event date (to ensure registrations happen at least 1 day before)
      const dayBeforeEvent = new Date(eventDate);
      dayBeforeEvent.setDate(dayBeforeEvent.getDate() - 1);

      // The max registration date is either the day before the event or today, whichever is earlier
      let maxRegistrationDate = new Date(
        Math.min(dayBeforeEvent.getTime(), today.getTime())
      );

      // CRITICAL FIX: Registration must be after event creation but STRICTLY BEFORE the event date
      // For past events, make sure creationTime is well before the event date
      let creationTime;
      
      if (isPastEvent) {
        // For past events, set creation date to 60 days before the event date
        const eventTime = new Date(event.eventDate).getTime();
        creationTime = eventTime - (60 * 24 * 60 * 60 * 1000); // 60 days before event
      } else {
        // For future events, use normal creation time logic
        creationTime = event.createdAt
          ? event.createdAt.getTime()
          : today.getTime() - 30 * 24 * 60 * 60 * 1000; // Default to 30 days ago
      }

      // Get the latest allowed registration date: 1 day before the event OR today, whichever is earlier
      const latestPossible = new Date(event.eventDate);
      latestPossible.setDate(latestPossible.getDate() - 1);
      latestPossible.setHours(23, 59, 59, 999);

      const maxRegDate = new Date(
        Math.min(latestPossible.getTime(), today.getTime())
      );

      // Registration date must be between event creation and the latest allowed registration time
      const regDate = new Date(
        creationTime + Math.random() * (maxRegDate.getTime() - creationTime)
      );

      // Add potential cancellation data
      const isCancelled = Math.random() < 0.1; // 10% chance of cancellation

      // Create data object for registration
      const registrationData: any = {
        eventId: event.id,
        participantId: participant.id,
        registeredAt: regDate,
        cancelled: isCancelled,
      };

      // Only add cancelledAt if it's cancelled
      if (isCancelled) {
        // Cancellation must be after registration but STRICTLY BEFORE the event
        const minCancelDate = regDate.getTime();

        // Calculate max cancel date (must be before event)
        const dayBeforeEvent = new Date(eventDate);
        dayBeforeEvent.setDate(dayBeforeEvent.getDate() - 1);

        // Max cancel date is either the day before event or today, whichever is earlier
        const maxCancelDate = Math.min(
          dayBeforeEvent.getTime(),
          today.getTime()
        );

        registrationData.cancelledAt = new Date(
          minCancelDate + Math.random() * (maxCancelDate - minCancelDate)
        );
      }

      // Create the registration
      registrationPromises.push(
        prisma.registration.create({
          data: registrationData,
        })
      );
    }
  }

  // Use Promise.all with properly typed promises
  const createdRegistrations = await Promise.all(registrationPromises);
  console.log(`Created ${createdRegistrations.length} registrations`);
}

// Execute the seed function
main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
