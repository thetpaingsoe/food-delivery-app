ALTER TABLE "orders" RENAME COLUMN "item" TO "menu_item_id";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "item_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "item_price" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_price" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "street" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "area" varchar(255) NOT NULL;