ALTER TABLE "tickets" RENAME COLUMN "item" TO "item_name";--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "quantity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "street" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "area" varchar(255) NOT NULL;