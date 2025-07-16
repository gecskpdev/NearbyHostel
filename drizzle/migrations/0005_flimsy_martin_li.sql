CREATE TABLE "comments" (
	"comment_id" serial PRIMARY KEY NOT NULL,
	"hostel_id" integer NOT NULL,
	"user_id" integer,
	"comment_text" text NOT NULL,
	"user_name" varchar(100),
	"user_email" varchar(255),
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hostel_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"hostel_id" integer NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"image_type" varchar(50) DEFAULT 'general',
	"is_primary" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hostel_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"hostel_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"option_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hostels" (
	"hostel_id" serial PRIMARY KEY NOT NULL,
	"hostel_name" varchar(255) NOT NULL,
	"hostel_description" text,
	"location" varchar(500) NOT NULL,
	"address" text,
	"phone_number" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"price_range" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"created_by_uid" integer,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"rating_id" serial PRIMARY KEY NOT NULL,
	"hostel_id" integer NOT NULL,
	"user_id" integer,
	"overall_rating" numeric(2, 1) NOT NULL,
	"cleanliness_rating" numeric(2, 1),
	"location_rating" numeric(2, 1),
	"value_rating" numeric(2, 1),
	"atmosphere_rating" numeric(2, 1),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "project_options" CASCADE;--> statement-breakpoint
DROP TABLE "projects" CASCADE;--> statement-breakpoint
DROP TABLE "team_members" CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_hostel_id_hostels_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("hostel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_images" ADD CONSTRAINT "hostel_images_hostel_id_hostels_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("hostel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_options" ADD CONSTRAINT "hostel_options_hostel_id_hostels_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("hostel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_options" ADD CONSTRAINT "hostel_options_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_options" ADD CONSTRAINT "hostel_options_option_id_category_option_values_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."category_option_values"("option_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_created_by_uid_users_uid_fk" FOREIGN KEY ("created_by_uid") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_hostel_id_hostels_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("hostel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;