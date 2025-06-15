import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

// -------------------- Users --------------------
export const users = pgTable("users", {
  uid: serial("uid").primaryKey(),
  userRole: varchar("user_role", { length: 50 }).notNull(),
});

// -------------------- Categories --------------------
export const categories = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(), // e.g. Project Type, Department, Programming Language
});

// -------------------- Projects --------------------
export const projects = pgTable("projects", {
  projectId: serial("project_id").primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  projectDescription: text("project_description"),
  projectLink: varchar("project_link", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  createdByUid: integer("created_by_uid").references(() => users.uid),
  customDomain: varchar("custom_domain", { length: 255 }),
  // These will now be handled via projectOptions table
  // projectType: varchar("project_type", { length: 100 }),
  // department: varchar("department", { length: 100 }),
  // domain: varchar("domain", { length: 100 }),
  // yearOfSubmission: varchar("year_of_submission", { length: 50 }),
});

// -------------------- Team Members --------------------
export const teamMembers = pgTable("team_members", {
  memberId: serial("member_id").primaryKey(),
  projectId: integer("project_id").references(() => projects.projectId),
  name: varchar("name", { length: 100 }),
  linkedin: varchar("linkedin", { length: 255 }),
});

// -------------------- Generic Category Options Values --------------------
export const categoryOptionValues = pgTable("category_option_values", {
  optionId: serial("option_id").primaryKey(),
  optionName: varchar("option_name", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.categoryId).notNull(),
});

// -------------------- Project-Category Options Link Table --------------------
export const projectOptions = pgTable("project_options", {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.projectId).notNull(),
    categoryId: integer("category_id").references(() => categories.categoryId).notNull(),
    optionId: integer("option_id").references(() => categoryOptionValues.optionId).notNull(),
  });
  