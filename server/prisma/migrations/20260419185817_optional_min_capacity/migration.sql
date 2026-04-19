-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "minCapacity" INTEGER,
    "maxCapacity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    CONSTRAINT "Hall_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hall" ("branchId", "description", "floor", "id", "images", "maxCapacity", "minCapacity", "name") SELECT "branchId", "description", "floor", "id", "images", "maxCapacity", "minCapacity", "name" FROM "Hall";
DROP TABLE "Hall";
ALTER TABLE "new_Hall" RENAME TO "Hall";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
