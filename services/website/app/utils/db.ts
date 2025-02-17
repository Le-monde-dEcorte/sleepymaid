import { createDrizzleInstance, type DrizzleInstance } from "@sleepymaid/db";
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
export const db: DrizzleInstance = createDrizzleInstance(DATABASE_URL);
