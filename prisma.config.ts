import { defineConfig } from "prisma/config";

export default defineConfig({
  // Prisma will read your schema from here
  schema: "prisma/schema.prisma",

  // This is your SQLite database file location
  datasource: {
    url: "file:./prisma/dev.db",
  },
});