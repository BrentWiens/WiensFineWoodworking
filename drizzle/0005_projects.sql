CREATE TABLE "project_income" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"income_date" date NOT NULL,
	"description" text NOT NULL,
	"total_cents" integer NOT NULL,
	"hst_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_income_total_positive" CHECK ("project_income"."total_cents" > 0),
	CONSTRAINT "project_income_hst_within_total" CHECK ("project_income"."hst_cents" >= 0 AND "project_income"."hst_cents" <= "project_income"."total_cents")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"name" text NOT NULL,
	"client" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "project_number" text;--> statement-breakpoint
ALTER TABLE "project_income" ADD CONSTRAINT "project_income_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_income_project" ON "project_income" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_number" ON "projects" USING btree ("number");