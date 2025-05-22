// setup-database.ts
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execAsync = promisify(exec);

const DB_NAME = process.env.DB_NAME || 'event_manager';
const DB_USER = process.env.DB_USER || process.env.POSTGRES_USER || 'postgres';
// Handle password properly - undefined is different from empty string for pg
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || null;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');

// Update DATABASE_URL in environment if needed
if (!process.env.DATABASE_URL) {
  // Format connection string differently based on whether password exists
  const connectionString = DB_PASSWORD 
    ? `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
    : `postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  
  process.env.DATABASE_URL = connectionString;
  console.log(chalk.blue(`Setting DATABASE_URL to: ${connectionString}`));
}

/**
 * Script to create the PostgreSQL database for the Event Workshop Manager System.
 * This script should be run before running migrations or seeding the database.
 */
async function setupDatabase() {
  console.log(chalk.blue('🔄 Starting database setup process...'));
  
  // Debug information
  console.log(chalk.blue('Database configuration from environment:'));
  console.log(chalk.blue(`  DB_USER: ${DB_USER}`));
  console.log(chalk.blue(`  DB_HOST: ${DB_HOST}`));
  console.log(chalk.blue(`  DB_PORT: ${DB_PORT}`));
  console.log(chalk.blue(`  DB_NAME: ${DB_NAME}`));
  console.log(chalk.blue(`  DB_PASSWORD: ${DB_PASSWORD ? '(provided)' : '(not provided)'}`));

  // Configure client with only defined properties
const clientConfig: any = {
    user: DB_USER,
    host: DB_HOST,
    port: DB_PORT,
    // Connect to default postgres database initially
    database: 'postgres',
    // Add SSL configuration if needed
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

// Only add password if it's provided (not null, undefined or empty string)
// For PostgreSQL, empty string is different from no password at all
if (DB_PASSWORD !== null && DB_PASSWORD !== undefined) {
  // Handle passwords with special characters
  clientConfig.password = DB_PASSWORD;
  console.log(chalk.blue(`Using password from environment variables`));
}

const pgClient = new Client(clientConfig);

  try {
    // Connect to postgres database to create our application database
    try {
      await pgClient.connect();
      console.log(chalk.green('✓ Connected to PostgreSQL server'));
    } catch (connectionError: any) {
      console.error(chalk.red('❌ Failed to connect to PostgreSQL server'));
      console.error(chalk.yellow('Connection details:'));
      console.error(chalk.yellow(`  Host: ${DB_HOST}`));
      console.error(chalk.yellow(`  Port: ${DB_PORT}`));
      console.error(chalk.yellow(`  User: ${DB_USER}`));
      console.error(chalk.yellow(`  Database: postgres`));
      console.error(chalk.yellow(`  Password: ${DB_PASSWORD ? '(provided)' : '(not provided)'}`));
      
      if (connectionError.message.includes('password')) {
        console.error(chalk.red('\nIt appears there might be an issue with the password authentication.'));
        console.error(chalk.yellow('If your PostgreSQL server requires a password, ensure DB_PASSWORD is set correctly in .env'));
        console.error(chalk.yellow('If your PostgreSQL server does not use password authentication, ensure DB_PASSWORD is empty or not set in .env'));
      }
      
      throw connectionError;
    }

    // Check if database already exists
    const checkResult = await pgClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      console.log(chalk.yellow(`⚠️ Database "${DB_NAME}" already exists`));
      
      const answer = await promptUser(`Do you want to drop the existing database and recreate it? (y/N): `);
      if (answer.toLowerCase() === 'y') {
        // Ensure no active connections before dropping
        await pgClient.query(
          `SELECT pg_terminate_backend(pg_stat_activity.pid) 
           FROM pg_stat_activity 
           WHERE pg_stat_activity.datname = $1 
           AND pid <> pg_backend_pid()`,
          [DB_NAME]
        );
        
        await pgClient.query(`DROP DATABASE ${DB_NAME}`);
        console.log(chalk.red(`✓ Dropped existing database "${DB_NAME}"`));
        
        // Create fresh database
        await pgClient.query(`CREATE DATABASE ${DB_NAME}`);
        console.log(chalk.green(`✓ Created fresh database "${DB_NAME}"`));
      } else {
        console.log(chalk.blue('ℹ️ Keeping existing database'));
      }
    } else {
      // Create new database
      await pgClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(chalk.green(`✓ Created new database "${DB_NAME}"`));
    }

    // Close the postgres connection
    await pgClient.end();

    // Run migrations
    console.log(chalk.blue('🔄 Running Prisma migrations...'));
    await execAsync('npx prisma migrate deploy');
    console.log(chalk.green('✓ Applied all migrations'));

    console.log(chalk.blue('🔄 Generating Prisma client...'));
    await execAsync('npx prisma generate');
    console.log(chalk.green('✓ Generated Prisma client'));

    // Ask if user wants to seed the database
    const seedAnswer = await promptUser('Do you want to seed the database with sample data? (Y/n): ');
    if (seedAnswer.toLowerCase() !== 'n') {
      console.log(chalk.blue('🔄 Seeding database...'));
      await execAsync('npm run db:seed');
      console.log(chalk.green('✓ Seeded database with sample data'));
    }

    console.log(chalk.green.bold('✅ Database setup completed successfully!'));
    console.log(chalk.blue.italic('\nYou can now start the application with: npm run dev'));
    
    console.log(chalk.gray(`\nDatabase connection string: postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}\n`));
    
    // Explicitly exit the process with success code after a short delay
    // to ensure all console output is flushed
    setTimeout(() => {
      process.exit(0);
    }, 100);

  } catch (error) {
    console.error(chalk.red('❌ Database setup failed:'), error);
    process.exit(1);
  }
}

// Simple utility to prompt for user input
function promptUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

// Run the setup function
setupDatabase().catch((error) => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
});
