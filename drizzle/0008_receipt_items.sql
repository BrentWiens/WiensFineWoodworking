ALTER TABLE "expenses" ADD COLUMN "receipt_group" text;--> statement-breakpoint
CREATE INDEX "expenses_receipt_group" ON "expenses" USING btree ("receipt_group");