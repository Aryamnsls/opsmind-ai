/**
 * OpsMind AI — Drizzle ORM Schema
 * Target: Amazon Aurora PostgreSQL
 *
 * To activate real Aurora connection, set DATABASE_URL env var.
 * All tables match the database design in the project spec.
 */

import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────

export const severityEnum = pgEnum("severity", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const incidentStatusEnum = pgEnum("incident_status", [
  "active",
  "investigating",
  "resolved",
  "closed",
]);

export const messageTypeEnum = pgEnum("message_type", ["user", "ai", "system"]);

// ── Users ─────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).default("engineer"),
  teamId: integer("team_id").references(() => teams.id),
  avatarUrl: text("avatar_url"),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }),
  faceId: varchar("face_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Teams ─────────────────────────────────────────────────────────────────

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Incidents ─────────────────────────────────────────────────────────────

export const incidents = pgTable("incidents", {
  id: varchar("id", { length: 20 }).primaryKey(), // e.g. "INC-201"
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  severity: severityEnum("severity").notNull().default("high"),
  status: incidentStatusEnum("status").notNull().default("active"),
  environment: varchar("environment", { length: 50 }).default("production"),
  owner: varchar("owner", { length: 255 }),
  service: varchar("service", { length: 255 }).notNull(),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  mttr: varchar("mttr", { length: 50 }), // e.g. "45m"
});

// ── Incident DNA ───────────────────────────────────────────────────────────

export const incidentDna = pgTable("incident_dna", {
  id: serial("id").primaryKey(),
  incidentId: varchar("incident_id", { length: 20 })
    .notNull()
    .references(() => incidents.id, { onDelete: "cascade" }),
  fingerprint: varchar("fingerprint", { length: 50 }).notNull(),
  errorSignatures: text("error_signatures").array().default([]),
  serviceName: varchar("service_name", { length: 255 }),
  cpuUsage: real("cpu_usage").default(0),
  memoryUsage: real("memory_usage").default(0),
  networkUsage: real("network_usage").default(0),
  deploymentMeta: text("deployment_meta"),
  infraComponents: text("infra_components").array().default([]),
  similarityScore: real("similarity_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Comments / War Room Messages ───────────────────────────────────────────

export const incidentComments = pgTable("incident_comments", {
  id: serial("id").primaryKey(),
  incidentId: varchar("incident_id", { length: 20 })
    .notNull()
    .references(() => incidents.id, { onDelete: "cascade" }),
  author: varchar("author", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 10 }),
  message: text("message").notNull(),
  messageType: messageTypeEnum("message_type").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── RCA Reports ────────────────────────────────────────────────────────────

export const rcaReports = pgTable("rca_reports", {
  id: serial("id").primaryKey(),
  incidentId: varchar("incident_id", { length: 20 })
    .notNull()
    .references(() => incidents.id, { onDelete: "cascade" }),
  rootCause: text("root_cause").notNull(),
  confidence: real("confidence").default(0),
  resolution: text("resolution"),
  prevention: text("prevention"),
  timeToResolve: varchar("time_to_resolve", { length: 50 }),
  aiModel: varchar("ai_model", { length: 100 }).default("openai-gpt-4o"),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Knowledge Base ─────────────────────────────────────────────────────────

export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id", { length: 20 }).primaryKey(), // e.g. "KB-001"
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().default([]),
  incidentRef: varchar("incident_ref", { length: 20 }).references(
    () => incidents.id
  ),
  successRate: real("success_rate").default(0),
  usedCount: integer("used_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Deployment History ─────────────────────────────────────────────────────

export const deploymentHistory = pgTable("deployment_history", {
  id: serial("id").primaryKey(),
  service: varchar("service", { length: 255 }).notNull(),
  version: varchar("version", { length: 100 }).notNull(),
  environment: varchar("environment", { length: 50 }).default("production"),
  deployedBy: varchar("deployed_by", { length: 255 }),
  status: varchar("status", { length: 50 }).default("success"), // success | failed | rolled-back
  incidentCorrelated: varchar("incident_correlated", {
    length: 20,
  }).references(() => incidents.id),
  metadata: jsonb("metadata"),
  deployedAt: timestamp("deployed_at").defaultNow(),
});

// ── Type exports ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;

export type IncidentDNA = typeof incidentDna.$inferSelect;
export type NewIncidentDNA = typeof incidentDna.$inferInsert;

export type IncidentComment = typeof incidentComments.$inferSelect;
export type NewIncidentComment = typeof incidentComments.$inferInsert;

export type RCAReport = typeof rcaReports.$inferSelect;
export type NewRCAReport = typeof rcaReports.$inferInsert;

export type KnowledgeBaseArticle = typeof knowledgeBase.$inferSelect;
export type NewKnowledgeBaseArticle = typeof knowledgeBase.$inferInsert;

export type DeploymentHistory = typeof deploymentHistory.$inferSelect;
export type NewDeploymentHistory = typeof deploymentHistory.$inferInsert;
