CREATE TABLE "odometer_years" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"year" integer NOT NULL,
	"start_km" integer,
	"end_km" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "odometer_years_end_after_start" CHECK ("odometer_years"."end_km" IS NULL OR "odometer_years"."start_km" IS NULL OR "odometer_years"."end_km" >= "odometer_years"."start_km")
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"one_way_km" numeric(7, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"trip_date" date NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"purpose" text NOT NULL,
	"distance_km" numeric(7, 1) NOT NULL,
	"round_trip" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trips_distance_positive" CHECK ("trips"."distance_km" > 0)
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "odometer_years" ADD CONSTRAINT "odometer_years_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "odometer_years_vehicle_year" ON "odometer_years" USING btree ("vehicle_id","year");--> statement-breakpoint
CREATE UNIQUE INDEX "places_name" ON "places" USING btree ("name");--> statement-breakpoint
CREATE INDEX "trips_trip_date" ON "trips" USING btree ("trip_date");