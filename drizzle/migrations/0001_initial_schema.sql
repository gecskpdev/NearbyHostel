CREATE TABLE "project_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"category_id" integer,
	"option_id" integer
);
--> statement-breakpoint
ALTER TABLE "project_options" ADD CONSTRAINT "project_options_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_options" ADD CONSTRAINT "project_options_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;