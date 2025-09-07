import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const getDb = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const client = neon(url);
    const db = drizzle({ client });
    return db;
  } catch (err) {
    console.error("Failed to initialize database client:", err);
    return null;
  }
};

export type DrizzleDb = NonNullable<ReturnType<typeof getDb>>;


