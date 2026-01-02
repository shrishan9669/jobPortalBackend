import express from "express";
import adminRouter from "./admin.js";
import userRouter from "./user.js";
import cors from "cors";
import dotenv from "dotenv";
import "dotenv/config";
import { DATABASE_URL } from "./config.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// IMPORTANT: dist/src se env 2 level upar hota hai
dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});
const app = express();
const PORT = 3000;
console.log("DATABASE_URL:", process.env.DATABASE_URL);
// CORS Configuration
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: false // "*" ke saath true allowed nahi hota
}));
// Routes
app.use("/admin", adminRouter);
app.use("/user", userRouter);
// Default route
app.get("/", (req, res) => res.send("OK"));
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map