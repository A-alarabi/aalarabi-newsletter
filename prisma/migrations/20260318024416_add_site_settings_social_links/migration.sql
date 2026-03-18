-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "site_name" TEXT NOT NULL DEFAULT 'العربي',
    "description" TEXT NOT NULL DEFAULT '',
    "logo_url" TEXT,
    "accent_color" TEXT NOT NULL DEFAULT '#e63946',
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT,
    "icon_url" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
