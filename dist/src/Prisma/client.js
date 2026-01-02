import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import { DATABASE_URL } from "../config.js";
const { PrismaClient } = pkg;
const pool = new pg.Pool({
    connectionString: DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ["error", "warn"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
//# sourceMappingURL=client.js.map