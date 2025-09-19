/*
  Warnings:

  - You are about to drop the column `endsAt` on the `campaigns` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `campaigns` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "budget" DECIMAL,
    "spent" DECIMAL NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL NOT NULL DEFAULT 0,
    "targetAudience" JSONB,
    "channels" JSONB,
    "products" JSONB,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_campaigns" ("budget", "channels", "clicks", "conversions", "createdAt", "description", "id", "impressions", "name", "products", "revenue", "spent", "status", "targetAudience", "type", "updatedAt") SELECT "budget", "channels", "clicks", "conversions", "createdAt", "description", "id", "impressions", "name", "products", "revenue", "spent", "status", "targetAudience", "type", "updatedAt" FROM "campaigns";
DROP TABLE "campaigns";
ALTER TABLE "new_campaigns" RENAME TO "campaigns";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
