CREATE TABLE "category_option_values" (
	"option_id" serial PRIMARY KEY NOT NULL,
	"option_name" varchar(255) NOT NULL,
	"category_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "category_option_values" ADD CONSTRAINT "category_option_values_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;