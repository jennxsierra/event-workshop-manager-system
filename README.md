# Event Workshop Manager System

This is an event and workshop management system designed to help organizations manage events, workshops, trainings and participant registrations.

It provides a user-friendly interface for both administrators and participants, allowing for easy event creation, registration, and management.

<details>
<summary><h2>Table of Contents</h2></summary>

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Set up the Database](#4-set-up-the-database)
  - [5. Database Seeding](#5-database-seeding)
  - [6. Start the Server](#6-start-the-server)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
  - [Database Connection Issues](#database-connection-issues)
  - [Script Hanging or Not Completing](#script-hanging-or-not-completing)
  - [Prisma Migration Issues](#prisma-migration-issues)
- [License](#license)
- [Acknowledgements](#acknowledgements)

</details>

## Features

- **User Management**: Admins can manage users, including creating, updating, and deleting user accounts.
- **Event Management**: Create, update, and delete events with various categories (workshops, training sessions, public outreach events).
- **Registration Management**: Participants can register for events, and admins can manage registrations.
- **Search and Filter**: Easily search and filter events based on categories, dates, and other criteria.
- **Role-Based Access Control**: Different roles (admin, staff, participants) with varying levels of access and permissions.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [PostgreSQL](https://www.postgresql.org/) (v14 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) package manager
- [TypeScript](https://www.typescriptlang.org/) (v5.0 or newer)

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/jennxsierra/event-workshop-manager-system.git
cd event-workshop-manager-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env` and update it with your database credentials:

```bash
cp .env.example .env
```

Then edit the `.env` file with your database configurations.

> [!IMPORTANT]
>
> - If your PostgreSQL installation doesn't use a password authentication (common in development setups), leave the `DB_PASSWORD` empty or remove the line entirely
> - If you're using password authentication, replace `your_password_here` with your actual PostgreSQL password
> - The DATABASE_URL will be automatically constructed based on your DB_* settings if not provided

### 4. Set up the Database

Run the database setup script:

```bash
npm run db:setup
```

This script will:

- Create the PostgreSQL database (or recreate it if it already exists)
- Run Prisma migrations to set up the schema
- Generate the Prisma client
- Optionally seed the database with sample data

These are some sample users that will be created which you can use to log in and test the application:

| Role        | Username  | Password    |
|-------------|-----------|-------------|
| Admin       | admin     | admin123    |
| Staff       | janesmith | password123 |
| Participant | jamesd    | password123 |

### 5. Database Seeding

You can manually seed the database with sample data by running:

```bash
npm run db:seed
```

This will populate the database with:

- Sample users (admin, staff, and participants)
- Various event categories (workshops, training sessions, public outreach events)
- Sample event registrations and cancellations

>[!NOTE]
>
> The database setup script (`npm run db:setup`) already seeds the database, so this step is only necessary if you skipped the seeding during setup or want to reseed the database.

### 6. Start the Server

To start the server, run:

```bash
npm run build
npm run start
```

This will build the application and start the production server.

Alternatively, for development mode with hot reloading, run:

```bash
npm run dev
```

This will start the server in development mode, allowing you to see changes without needing to rebuild the application.

The application will be available at [http://localhost:3000](http://localhost:3000). You can also access it by using `Ctrl + Click` on the link displayed in the terminal when the server starts.

## Available Scripts

- `npm run clean` - Cleans the build directory
- `npm run dev` - Starts the development server with hot reload
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run db:setup` - Sets up the database, runs migrations and optionally seeds data
- `npm run db:seed` - Seeds the database with sample data

## Troubleshooting

>[!WARNING]
>
> This application and its setup process are intended for use with Linux-based systems. If you're using Windows or MacOS, you may encounter issues with the database setup script or other commands. It's recommended to use WSL (Windows Subsystem for Linux) or a Linux virtual machine for a smoother experience.

### Database Connection Issues

If you encounter issues with the database setup:

1. **Check your PostgreSQL credentials**: Ensure your database credentials in `.env` are correct
2. **PostgreSQL Authentication**: If you're using password authentication, make sure your password is correctly set in the `DB_PASSWORD` field
3. **Special Characters in Password**: If your password contains special characters (like #, %, etc.), make sure they're properly handled
4. **Connection String**: Verify that the `DATABASE_URL` environment variable is properly formatted:
   - With password: `postgresql://username:password@host:port/database`
   - Without password: `postgresql://username@host:port/database`

### Script Hanging or Not Completing

If the database setup script seems to hang:

1. Press `Ctrl+C` to terminate it
2. Check your `.env` file to ensure all required database parameters are present
3. Run the script again with the corrected configuration

### Prisma Migration Issues

If you encounter issues with Prisma migrations:

1. Reset the database: `npx prisma migrate reset` (this will erase all data)
2. Run the setup script again: `npm run db:setup`

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- This project was developed as my final project for the **[CMPS2232] Object Oriented Programming** course under the Associate of Information Technology program at the [University of the Belize](https://www.ub.edu.bz/).
- Special thanks to my instructor, Ms. Vernelle Sylvester, for her guidance throughout the course and for providing valuable feedback on the project.
- Thanks to Mr. Dalwin Lewis for emparting his knowledge and experience in MVC architecture and design patterns.
- Thanks to the open-source community for providing the tools and libraries that made this project possible. Long live open-source!
