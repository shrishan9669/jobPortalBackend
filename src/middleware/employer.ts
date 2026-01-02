import type  { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";
import {prisma} from '../Prisma/client.js'

export interface AuthRequest extends Request {
  user?: any;
}
export const requireAuthEmployer = async(req:AuthRequest,res:Response,next:NextFunction)=>{
  try {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];//Removes bearer



    if (!token) return res.status(401).json({ error: "Access denied , no token provided"});
    
    const payload = verifyJwt<{ id: number }>(token);

    if (!payload?.id) return res.status(500).json({ error: "No id found on token" });

   
    const user = await prisma.employer.findUnique({ where: { id: payload.id } });
    if (!user) return res.json({ error: "No user found with Id" });

    req.user = user;
    next();
  } catch (err: any) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(500).json({ error: "Authentication failed" });
  }
}