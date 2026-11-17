CREATE TABLE "capital_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cca_class" text NOT NULL,
	"acquired_date" date NOT NULL,
	"cost_cents" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capital_assets_cost_positive" CHECK ("capital_assets"."cost_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "cca_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"cca_class" text NOT NULL,
	"claimed_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cca_claims_not_negative" CHECK ("cca_claims"."claimed_cents" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cca_claims_year_class" ON "cca_claims" USING btree ("year","cca_class");