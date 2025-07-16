ALTER TABLE "users" ADD COLUMN "firebase_uid" varchar(64);--> statement-breakpoint
ALTER TABLE "ratings" DROP COLUMN "cleanliness_rating";--> statement-breakpoint
ALTER TABLE "ratings" DROP COLUMN "location_rating";--> statement-breakpoint
ALTER TABLE "ratings" DROP COLUMN "value_rating";--> statement-breakpoint
ALTER TABLE "ratings" DROP COLUMN "atmosphere_rating";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid");