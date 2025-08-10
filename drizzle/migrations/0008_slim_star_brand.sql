CREATE TABLE "project_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"option_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"project_id" serial PRIMARY KEY NOT NULL,
	"project_name" varchar(255),
	"project_description" text,
	"project_link" varchar(255),
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"member_id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"linkedin" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "project_options" ADD CONSTRAINT "project_options_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_options" ADD CONSTRAINT "project_options_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_options" ADD CONSTRAINT "project_options_option_id_category_option_values_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."category_option_values"("option_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;