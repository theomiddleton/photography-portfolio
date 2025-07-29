-- Storage Usage Monitoring Schema Migration
-- Run this with: pnpm drizzle-kit push

-- Storage usage tracking table
CREATE TABLE IF NOT EXISTS "pp_storageUsage" (
	"id" serial PRIMARY KEY NOT NULL,
	"bucketName" varchar(256) NOT NULL,
	"usageBytes" bigint NOT NULL,
	"objectCount" integer NOT NULL,
	"measurementDate" timestamp DEFAULT now() NOT NULL,
	"alertTriggered" boolean DEFAULT false NOT NULL,
	"alertThresholdBytes" bigint DEFAULT 9000000000
);

-- Alert dismissals table
CREATE TABLE IF NOT EXISTS "pp_alertDismissals" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"alertType" varchar(100) NOT NULL,
	"bucketName" varchar(256),
	"dismissedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"dismissalDuration" varchar(50) NOT NULL
);

-- Duplicate files tracking table
CREATE TABLE IF NOT EXISTS "pp_duplicateFiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"fileHash" varchar(64) NOT NULL,
	"fileName" varchar(256) NOT NULL,
	"bucketName" varchar(256) NOT NULL,
	"objectKey" varchar(512) NOT NULL,
	"fileSize" bigint NOT NULL,
	"lastModified" timestamp NOT NULL,
	"dbReference" varchar(100),
	"dbRecordId" integer,
	"uuid" varchar(36),
	"scanDate" timestamp DEFAULT now() NOT NULL
);

-- Usage alert configuration table
CREATE TABLE IF NOT EXISTS "pp_usageAlertConfig" (
	"id" serial PRIMARY KEY NOT NULL,
	"bucketName" varchar(256) NOT NULL,
	"warningThresholdPercent" integer DEFAULT 80 NOT NULL,
	"criticalThresholdPercent" integer DEFAULT 95 NOT NULL,
	"maxStorageBytes" bigint DEFAULT 10000000000 NOT NULL,
	"emailAlertsEnabled" boolean DEFAULT true NOT NULL,
	"lastWarningEmailSent" timestamp,
	"lastCriticalEmailSent" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pp_usageAlertConfig_bucketName_unique" UNIQUE("bucketName")
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "pp_alertDismissals" ADD CONSTRAINT "pp_alertDismissals_userId_pp_users_id_fk" FOREIGN KEY ("userId") REFERENCES "pp_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_storageUsage_bucketName_measurementDate" ON "pp_storageUsage"("bucketName", "measurementDate");
CREATE INDEX IF NOT EXISTS "idx_alertDismissals_userId_expiresAt" ON "pp_alertDismissals"("userId", "expiresAt");
CREATE INDEX IF NOT EXISTS "idx_duplicateFiles_fileHash" ON "pp_duplicateFiles"("fileHash");
CREATE INDEX IF NOT EXISTS "idx_duplicateFiles_bucketName" ON "pp_duplicateFiles"("bucketName");

-- Insert default alert configurations for known buckets
INSERT INTO "pp_usageAlertConfig" ("bucketName", "warningThresholdPercent", "criticalThresholdPercent", "maxStorageBytes", "emailAlertsEnabled")
SELECT bucket_name, 80, 95, 10000000000, true
FROM (
  VALUES 
    ('Main Images'),
    ('Blog Images'), 
    ('About Images'),
    ('Custom Images')
) AS buckets(bucket_name)
WHERE NOT EXISTS (
  SELECT 1 FROM "pp_usageAlertConfig" WHERE "bucketName" = buckets.bucket_name
);