ALTER TABLE "department" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "domain" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_type" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "year_of_submission" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "department" CASCADE;--> statement-breakpoint
DROP TABLE "domain" CASCADE;--> statement-breakpoint
DROP TABLE "project_type" CASCADE;--> statement-breakpoint
DROP TABLE "year_of_submission" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_category_id_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "project_options" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_options" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_options" ALTER COLUMN "option_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_options" ADD CONSTRAINT "project_options_option_id_category_option_values_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."category_option_values"("option_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "option_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "category_id";