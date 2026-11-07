CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_date" date NOT NULL,
	"vendor" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"total_cents" integer NOT NULL,
	"hst_cents" integer DEFAULT 0 NOT NULL,
	"vehicle_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expenses_total_positive" CHECK ("expenses"."total_cents" > 0),
	CONSTRAINT "expenses_hst_within_total" CHECK ("expenses"."hst_cents" >= 0 AND "expenses"."hst_cents" <= "expenses"."total_cents")
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_expense_date" ON "expenses" USING btree ("expense_date");