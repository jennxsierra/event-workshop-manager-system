import { PrismaClient, Role, EventCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
  console.log('Starting database seed process...');
  
  // Reset the database
  await resetDatabase();
  
  // Create users (admins, staff, participants)
  const users = await createUsers();
  
  // Create events across all categories
  const events = await createEvents(users.staffUsers[0].id);
  
  // Create registrations
  await createRegistrations(events, users.participantUsers);
  
  console.log('Seed completed successfully!');
}

/**
 * Reset the database by deleting all records
 */
async function resetDatabase() {
  console.log('Resetting database...');
  
  // Delete in reverse order to respect foreign key constraints
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Database reset completed');
}

/**
 * Create admin, staff and participant users
 */
async function createUsers() {
  console.log('Creating users...');
  
  // Create admin users
  const adminUsers = await Promise.all([
    createUser('admin', 'admin123', 'System', 'Administrator', 'admin@example.com', Role.ADMIN),
    createUser('johndoe', 'password123', 'John', 'Doe', 'john.doe@example.com', Role.ADMIN)
  ]);
  
  // Create staff users
  const staffUsers = await Promise.all([
    createUser('janesmith', 'password123', 'Jane', 'Smith', 'jane.smith@example.com', Role.STAFF),
    createUser('michaelb', 'password123', 'Michael', 'Brown', 'michael.brown@example.com', Role.STAFF),
    createUser('laurat', 'password123', 'Laura', 'Taylor', 'laura.taylor@example.com', Role.STAFF)
  ]);
  
  // Create participant users
  const participantUsers = await Promise.all([
    createUser('samwilson', 'password123', 'Sam', 'Wilson', 'sam.wilson@example.com', Role.PARTICIPANT),
    createUser('emilyd', 'password123', 'Emily', 'Davis', 'emily.davis@example.com', Role.PARTICIPANT),
    createUser('robertj', 'password123', 'Robert', 'Johnson', 'robert.johnson@example.com', Role.PARTICIPANT),
    createUser('oliviaw', 'password123', 'Olivia', 'White', 'olivia.white@example.com', Role.PARTICIPANT),
    createUser('thomasm', 'password123', 'Thomas', 'Miller', 'thomas.miller@example.com', Role.PARTICIPANT),
    createUser('sophiab', 'password123', 'Sophia', 'Baker', 'sophia.baker@example.com', Role.PARTICIPANT),
    createUser('williamm', 'password123', 'William', 'Moore', 'william.moore@example.com', Role.PARTICIPANT),
    createUser('emmat', 'password123', 'Emma', 'Taylor', 'emma.taylor@example.com', Role.PARTICIPANT),
    createUser('jamesd', 'password123', 'James', 'Davis', 'james.davis@example.com', Role.PARTICIPANT),
    createUser('averya', 'password123', 'Avery', 'Anderson', 'avery.anderson@example.com', Role.PARTICIPANT)
  ]);
  
  console.log(`Created ${adminUsers.length} admin users, ${staffUsers.length} staff users, and ${participantUsers.length} participants`);
  
  return {
    adminUsers,
    staffUsers,
    participantUsers
  };
}

/**
 * Helper function to create a single user
 */
async function createUser(username: string, password: string, firstName: string, lastName: string, email: string, role: Role) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: {
      username,
      passwordHash,
      firstName,
      lastName,
      email,
      role,
      phone: '+1' + Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
      organization: role !== Role.PARTICIPANT ? 'Event Workshop Management System' : 
                   ['ABC Corporation', 'XYZ Inc', 'Acme Co', 'TechStart', 'Global Services', 'Local Business'][Math.floor(Math.random() * 6)]
    }
  });
}

/**
 * Create events across all categories
 */
async function createEvents(creatorId: bigint) {
  console.log('Creating events across all categories...');
  
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
      name: 'Web Development Fundamentals Workshop',
      category: EventCategory.WORKSHOP,
      eventDate: nextWeek,
      startTime: new Date(nextWeek.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(nextWeek.getTime() + 17 * 60 * 60 * 1000), // 5 PM
      location: 'Tech Hub, San Francisco',
      capacity: 50,
      createdById: creatorId,
      description: 'This full-day workshop introduces participants to the fundamentals of web development. Topics include HTML5, CSS3, JavaScript basics, and responsive design. Perfect for beginners looking to start their journey in web development. All materials and lunch will be provided.'
    }),
    createEvent({
      name: 'Advanced React Patterns Workshop',
      category: EventCategory.WORKSHOP,
      eventDate: new Date(nextWeek.getTime() + (14 * 24 * 60 * 60 * 1000)), // 2 weeks after next week
      startTime: new Date(nextWeek.getTime() + (14 * 24 * 60 * 60 * 1000) + 10 * 60 * 60 * 1000), // 10 AM
      endTime: new Date(nextWeek.getTime() + (14 * 24 * 60 * 60 * 1000) + 16 * 60 * 60 * 1000), // 4 PM
      location: 'Tech Hub, San Francisco',
      capacity: 40,
      createdById: creatorId,
      description: 'Dive deep into advanced React design patterns with this intensive workshop. Learn about component composition, render props, custom hooks, state management strategies, and performance optimizations. This workshop is intended for developers with existing React experience who want to take their skills to the next level.'
    })
  ]);
  
  // Create training events
  const training = await Promise.all([
    createEvent({
      name: 'Leadership Training Program',
      category: EventCategory.TRAINING,
      eventDate: new Date(nextWeek.getTime() + (10 * 24 * 60 * 60 * 1000)),
      startTime: new Date(nextWeek.getTime() + (10 * 24 * 60 * 60 * 1000) + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(nextWeek.getTime() + (10 * 24 * 60 * 60 * 1000) + 17 * 60 * 60 * 1000), // 5 PM
      location: 'Business Center, Chicago',
      capacity: 25,
      createdById: creatorId,
      description: 'An intensive leadership development program designed for emerging leaders and managers. This training focuses on essential leadership skills including effective communication, team building, conflict resolution, and strategic thinking. Participants will engage in hands-on exercises and receive personalized feedback throughout the day.'
    }),
    createEvent({
      name: 'Project Management Certification',
      category: EventCategory.TRAINING,
      eventDate: new Date(nextMonth.getTime() + (15 * 24 * 60 * 60 * 1000)),
      startTime: new Date(nextMonth.getTime() + (15 * 24 * 60 * 60 * 1000) + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(nextMonth.getTime() + (15 * 24 * 60 * 60 * 1000) + 17 * 60 * 60 * 1000), // 5 PM
      location: 'Training Center, New York',
      capacity: 30,
      createdById: creatorId,
      description: 'This comprehensive certification training prepares participants for the Project Management Professional (PMP) exam. The course covers all knowledge areas in the PMBOK Guide, including project integration, scope, time, cost, quality, resource, communications, risk, procurement, and stakeholder management. Includes study materials and practice exams.'
    })
  ]);
  
  // Create public outreach events
  const publicEvents = await Promise.all([
    createEvent({
      name: 'Community Tech Fair 2025',
      category: EventCategory.PUBLIC_OUTREACH,
      eventDate: nextMonth,
      startTime: new Date(nextMonth.getTime() + 10 * 60 * 60 * 1000), // 10 AM
      endTime: new Date(nextMonth.getTime() + 16 * 60 * 60 * 1000), // 4 PM
      location: 'City Park, San Francisco',
      capacity: 200,
      createdById: creatorId,
      description: 'Join us for the largest community tech fair in San Francisco! This free event features demonstrations of cutting-edge technology, interactive exhibits, educational workshops, and opportunities to connect with tech industry professionals. Family-friendly activities will be available for all age groups. Food vendors will be on site.'
    }),
    createEvent({
      name: 'Coding for Kids',
      category: EventCategory.PUBLIC_OUTREACH,
      eventDate: new Date(nextWeek.getTime() + (21 * 24 * 60 * 60 * 1000)), // 3 weeks after next week
      startTime: new Date(nextWeek.getTime() + (21 * 24 * 60 * 60 * 1000) + 13 * 60 * 60 * 1000), // 1 PM
      endTime: new Date(nextWeek.getTime() + (21 * 24 * 60 * 60 * 1000) + 16 * 60 * 60 * 1000), // 4 PM
      location: 'Public Library, Seattle',
      capacity: 30,
      createdById: creatorId,
      description: 'A fun, introductory coding workshop designed specifically for children aged 8-12. Participants will learn basic programming concepts through engaging games and activities. No prior coding experience required. All necessary equipment will be provided. Parents are welcome to observe or participate alongside their children.'
    })
  ]);
  
  // Create press events
  const pressEvents = await Promise.all([
    createEvent({
      name: 'Q2 Media Briefing',
      category: EventCategory.PRESS,
      eventDate: nextWeek,
      startTime: new Date(nextWeek.getTime() + 14 * 60 * 60 * 1000), // 2 PM
      endTime: new Date(nextWeek.getTime() + 16 * 60 * 60 * 1000), // 4 PM
      location: 'Conference Center, New York',
      capacity: 50,
      createdById: creatorId,
      description: 'This quarterly media briefing will provide an overview of our Q2 financial results, strategic initiatives, and upcoming product roadmap. The session will include presentations from executive leadership followed by a Q&A session. Refreshments will be served. Press credentials required for entry.'
    }),
    createEvent({
      name: 'Annual Press Conference',
      category: EventCategory.PRESS,
      eventDate: new Date(twoMonthsLater.getTime() + (15 * 24 * 60 * 60 * 1000)),
      startTime: new Date(twoMonthsLater.getTime() + (15 * 24 * 60 * 60 * 1000) + 10 * 60 * 60 * 1000), // 10 AM
      endTime: new Date(twoMonthsLater.getTime() + (15 * 24 * 60 * 60 * 1000) + 12 * 60 * 60 * 1000), // 12 PM
      location: 'Media Center, Los Angeles',
      capacity: 75,
      createdById: creatorId,
      description: 'Our flagship annual press conference where we will announce major company developments, reveal new products, and outline our vision for the coming year. The CEO and executive team will deliver presentations followed by an extensive media Q&A session. Light breakfast will be provided. Press credentials required.'
    })
  ]);
  
  // Create launch events
  const launchEvents = await Promise.all([
    createEvent({
      name: 'Product X Launch Event',
      category: EventCategory.LAUNCH,
      eventDate: new Date(nextMonth.getTime() + (5 * 24 * 60 * 60 * 1000)),
      startTime: new Date(nextMonth.getTime() + (5 * 24 * 60 * 60 * 1000) + 18 * 60 * 60 * 1000), // 6 PM
      endTime: new Date(nextMonth.getTime() + (5 * 24 * 60 * 60 * 1000) + 21 * 60 * 60 * 1000), // 9 PM
      location: 'Grand Hall, San Francisco',
      capacity: 300,
      createdById: creatorId,
      description: 'Be among the first to experience our revolutionary Product X! This exclusive evening launch event will feature spectacular product demonstrations, hands-on experience zones, and presentations from the product development team. The event includes a cocktail reception with gourmet hors d\'oeuvres, entertainment, and a special gift bag for all attendees.'
    }),
    createEvent({
      name: 'Annual Software Release',
      category: EventCategory.LAUNCH,
      eventDate: new Date(twoMonthsLater.getTime()),
      startTime: new Date(twoMonthsLater.getTime() + 10 * 60 * 60 * 1000), // 10 AM
      endTime: new Date(twoMonthsLater.getTime() + 14 * 60 * 60 * 1000), // 2 PM
      location: 'Tech Campus, Mountain View',
      capacity: 150,
      createdById: creatorId,
      description: 'Join us for the unveiling of our next-generation software platform. This event will showcase the new features, improvements, and integrations in our latest release. Technical demonstrations and breakout sessions will be led by our lead engineers and product managers. Lunch will be provided and attendees will receive early access to the beta version.'
    })
  ]);
  
  // Past events for reporting
  const pastEvents = await Promise.all([
    createEvent({
      name: 'Spring Web Development Workshop',
      category: EventCategory.WORKSHOP,
      eventDate: lastMonth,
      startTime: new Date(lastMonth.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(lastMonth.getTime() + 17 * 60 * 60 * 1000), // 5 PM
      location: 'Tech Hub, Austin',
      capacity: 40,
      createdById: creatorId,
      description: 'Our popular web development workshop focused on spring framework developments and integrations. This workshop covered Spring Boot, Spring Security, and microservices architecture. Participants built a complete web application during the hands-on session with guidance from experienced instructors.'
    }),
    createEvent({
      name: 'Public Health Initiative',
      category: EventCategory.PUBLIC_OUTREACH,
      eventDate: lastWeek,
      startTime: new Date(lastWeek.getTime() + 10 * 60 * 60 * 1000), // 10 AM
      endTime: new Date(lastWeek.getTime() + 14 * 60 * 60 * 1000), // 2 PM
      location: 'Community Center, Miami',
      capacity: 80,
      createdById: creatorId,
      description: 'A community outreach event focused on public health education and resources. Free health screenings were provided along with educational sessions on preventive care, nutrition, and mental health awareness. Local healthcare providers were present to answer questions and connect residents with available services.'
    }),
    createEvent({
      name: 'Winter Product Launch 2024',
      category: EventCategory.LAUNCH,
      eventDate: new Date(today.getFullYear() - 1, 11, 10), // Last year Dec 10
      startTime: new Date(new Date(today.getFullYear() - 1, 11, 10).getTime() + 18 * 60 * 60 * 1000), // 6 PM
      endTime: new Date(new Date(today.getFullYear() - 1, 11, 10).getTime() + 21 * 60 * 60 * 1000), // 9 PM
      location: 'Convention Center, Las Vegas',
      capacity: 450,
      createdById: creatorId,
      description: 'Our largest product launch of 2024 unveiled our flagship product line for the coming year. The event featured keynote presentations from industry leaders, immersive product demonstrations, and networking opportunities with engineers and designers. The evening concluded with a gala dinner and entertainment by award-winning performers.'
    })
  ]);
  
  const allEvents = [...workshops, ...training, ...publicEvents, ...pressEvents, ...launchEvents, ...pastEvents];
  console.log(`Created ${allEvents.length} events`);
  
  return allEvents;
}

/**
 * Helper function to create a single event
 */
async function createEvent(eventData: {
  name: string,
  category: EventCategory,
  eventDate: Date,
  startTime: Date,
  endTime: Date,
  location: string,
  capacity: number,
  createdById: bigint,
  description?: string
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
      description: eventData.description
    }
  });
}

/**
 * Create registrations for events
 */
async function createRegistrations(events: any[], participants: any[]) {
  console.log('Creating registrations...');
  
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
      
      // Randomize registration date (between event creation and event date)
      const regDate = new Date(event.createdAt.getTime() + 
        Math.random() * (event.eventDate.getTime() - event.createdAt.getTime()));
      
      // Add potential cancellation data
      const isCancelled = Math.random() < 0.1; // 10% chance of cancellation
      
      // Create data object for registration
      const registrationData: any = {
        eventId: event.id,
        participantId: participant.id,
        registeredAt: regDate,
        cancelled: isCancelled
      };
      
      // Only add cancelledAt if it's cancelled
      if (isCancelled) {
        registrationData.cancelledAt = new Date(regDate.getTime() + 
          Math.random() * (new Date().getTime() - regDate.getTime()));
      }
      
      // Create the registration
      registrationPromises.push(
        prisma.registration.create({
          data: registrationData
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
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
