import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";

// -------------------- Users --------------------
export const users = pgTable("users", {
  uid: serial("uid").primaryKey(),
  userRole: varchar("user_role", { length: 50 }).notNull(),
  firebaseUid: varchar("firebase_uid", { length: 64 }).unique(), // For Firebase UID mapping
  displayName: varchar("display_name", { length: 100 }), // User's display name
});

// -------------------- Categories --------------------
export const categories = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(), // e.g. Amenities, Room Type, Location Type
});

// -------------------- Hostels --------------------
export const hostels = pgTable("hostels", {
  hostelId: serial("hostel_id").primaryKey(),
  hostelName: varchar("hostel_name", { length: 255 }).notNull(),
  hostelDescription: text("hostel_description"),
  location: varchar("location", { length: 500 }).notNull(), // Google Maps link
  address: text("address"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  priceRange: varchar("price_range", { length: 100 }), // e.g. "$20-50", "$50-100"
  createdAt: timestamp("created_at").defaultNow(),
  createdByUid: integer("created_by_uid").references(() => users.uid),
  isActive: boolean("is_active").default(true),
});

// -------------------- Hostel Images --------------------
export const hostelImages = pgTable("hostel_images", {
  imageId: serial("image_id").primaryKey(),
  hostelId: integer("hostel_id").references(() => hostels.hostelId).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  imageType: varchar("image_type", { length: 50 }).default("general"), // general, room, common_area, etc.
  isPrimary: boolean("is_primary").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// -------------------- Ratings --------------------
export const ratings = pgTable("ratings", {
  ratingId: serial("rating_id").primaryKey(),
  hostelId: integer("hostel_id").references(() => hostels.hostelId).notNull(),
  userId: integer("user_id").references(() => users.uid),
  overallRating: decimal("overall_rating", { precision: 2, scale: 1 }).notNull(), // 1.0 to 5.0
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------- Comments --------------------
export const comments = pgTable("comments", {
  commentId: serial("comment_id").primaryKey(),
  hostelId: integer("hostel_id").references(() => hostels.hostelId).notNull(),
  userId: integer("user_id").references(() => users.uid),
  commentText: text("comment_text").notNull(),
  userName: varchar("user_name", { length: 100 }),
  userEmail: varchar("user_email", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------- Generic Category Options Values --------------------
export const categoryOptionValues = pgTable("category_option_values", {
  optionId: serial("option_id").primaryKey(),
  optionName: varchar("option_name", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.categoryId).notNull(),
});

// -------------------- Hostel-Category Options Link Table --------------------
export const hostelOptions = pgTable("hostel_options", {
    id: serial("id").primaryKey(),
    hostelId: integer("hostel_id").references(() => hostels.hostelId).notNull(),
    categoryId: integer("category_id").references(() => categories.categoryId).notNull(),
    optionId: integer("option_id").references(() => categoryOptionValues.optionId).notNull(),
  });
  
// -------------------- Projects --------------------
export const projects = pgTable("projects", {
  projectId: serial("project_id").primaryKey(),
  projectName: varchar("project_name", { length: 255 }),
  projectDescription: text("project_description"),
  projectLink: varchar("project_link", { length: 255 }),
  createdAt: timestamp("created_at"),
  // Add other columns if needed
});

// -------------------- Team Members --------------------
export const teamMembers = pgTable("team_members", {
  memberId: serial("member_id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.projectId)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  linkedin: varchar("linkedin", { length: 255 }),
});

// -------------------- Project Options --------------------
export const projectOptions = pgTable("project_options", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.projectId)
    .notNull(),
  categoryId: integer("category_id")
    .references(() => categories.categoryId)
    .notNull(),
  optionId: integer("option_id")
    .references(() => categoryOptionValues.optionId)
    .notNull(),
});