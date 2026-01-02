import { defineConfig } from "@prisma/config";
import "dotenv/config";
import { DATABASE_URL } from "./src/config.js";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env file");
}
export default defineConfig({
    schema: "./prisma/schema.prisma", // relative path fix
    datasource: {
        url: DATABASE_URL,
    }
});
//# sourceMappingURL=prisma.config.js.map