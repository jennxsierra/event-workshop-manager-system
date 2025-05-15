-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTICIPANT', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('WORKSHOP', 'TRAINING', 'PUBLIC_OUTREACH', 'PRESS', 'LAUNCH');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organization" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PARTICIPANT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" BIGSERIAL NOT NULL,
    "event_id" BIGINT NOT NULL,
    "participant_id" BIGINT,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_events_event_date" ON "Event"("event_date");

-- CreateIndex
CREATE INDEX "idx_events_category" ON "Event"("category");

-- CreateIndex
CREATE INDEX "idx_regs_event" ON "Registration"("event_id");

-- CreateIndex
CREATE INDEX "idx_regs_participant" ON "Registration"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_event_id_participant_id_key" ON "Registration"("event_id", "participant_id");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------
-- Partial Unique Indexes
-- Ensure username/email are unique only among active users
-- -------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "uq_users_username_active"
  ON "User" ("username")
  WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_users_email_active"
  ON "User" ("email")
  WHERE "deleted_at" IS NULL;


-- -------------------------------
-- Capacity Enforcement Trigger
-- Blocks registrations when an event is full
-- -------------------------------
CREATE OR REPLACE FUNCTION check_event_capacity()
  RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cancelled = FALSE THEN
    IF (
      SELECT COUNT(*) 
      FROM "Registration"
      WHERE event_id = NEW.event_id
        AND cancelled = FALSE
    ) >= (
      SELECT capacity
      FROM "Event"
      WHERE id = NEW.event_id
    ) THEN
      RAISE EXCEPTION 'Event % is already full', NEW.event_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_capacity ON "Registration";
CREATE TRIGGER trg_capacity
  BEFORE INSERT OR UPDATE OF cancelled
  ON "Registration"
  FOR EACH ROW
  EXECUTE FUNCTION check_event_capacity();


-- -------------------------------
-- updated_at Auto-Stamp Trigger
-- Keeps updated_at in sync on any row update
-- -------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON "User";
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE
  ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON "Event";
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE
  ON "Event"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
