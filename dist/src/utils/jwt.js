// src/utils/jwt.ts
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "Job_Portal";
// Sign JWT
export function signJwt(payload, expiresIn = "7d") {
    return jwt.sign(payload, SECRET, { expiresIn });
}
// Verify JWT
export function verifyJwt(token) {
    return jwt.verify(token, SECRET);
}
//# sourceMappingURL=jwt.js.map