CREATE TYPE "public"."incident_status" AS ENUM('active', 'investigating', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('user', 'ai', 'system');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TABLE "deployment_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"service" varchar(255) NOT NULL,
	"version" varchar(100) NOT NULL,
	"environment" varchar(50) DEFAULT 'production',
	"deployed_by" varchar(255),
	"status" varchar(50) DEFAULT 'success',
	"incident_correlated" varchar(20),
	"metadata" jsonb,
	"deployed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incident_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" varchar(20) NOT NULL,
	"author" varchar(255) NOT NULL,
	"avatar" varchar(10),
	"message" text NOT NULL,
	"message_type" "message_type" DEFAULT 'user',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incident_dna" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" varchar(20) NOT NULL,
	"fingerprint" varchar(50) NOT NULL,
	"error_signatures" text[] DEFAULT '{}',
	"service_name" varchar(255),
	"cpu_usage" real DEFAULT 0,
	"memory_usage" real DEFAULT 0,
	"network_usage" real DEFAULT 0,
	"deployment_meta" text,
	"infra_components" text[] DEFAULT '{}',
	"similarity_score" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"severity" "severity" DEFAULT 'high' NOT NULL,
	"status" "incident_status" DEFAULT 'active' NOT NULL,
	"environment" varchar(50) DEFAULT 'production',
	"owner" varchar(255),
	"service" varchar(255) NOT NULL,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"mttr" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "knowledge_base" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"incident_ref" varchar(20),
	"success_rate" real DEFAULT 0,
	"used_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rca_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" varchar(20) NOT NULL,
	"root_cause" text NOT NULL,
	"confidence" real DEFAULT 0,
	"resolution" text,
	"prevention" text,
	"time_to_resolve" varchar(50),
	"ai_model" varchar(100) DEFAULT 'openai-gpt-4o',
	"tokens_used" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'engineer',
	"team_id" integer,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "deployment_history" ADD CONSTRAINT "deployment_history_incident_correlated_incidents_id_fk" FOREIGN KEY ("incident_correlated") REFERENCES "public"."incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_comments" ADD CONSTRAINT "incident_comments_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_dna" ADD CONSTRAINT "incident_dna_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_incident_ref_incidents_id_fk" FOREIGN KEY ("incident_ref") REFERENCES "public"."incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rca_reports" ADD CONSTRAINT "rca_reports_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;