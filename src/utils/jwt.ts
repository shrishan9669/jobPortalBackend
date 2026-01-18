// src/utils/jwt.ts
import  jwt from "jsonwebtoken";


const SECRET = process.env.JWT_SECRET || "Job_Portal";

// Sign JWT

export function signJwt(payload: object, expiresIn: string | number = "7d"): string {
  return jwt.sign(payload, SECRET as jwt.Secret, { expiresIn });
}

// Verify JWT
export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, SECRET as jwt.Secret) as T;
}
