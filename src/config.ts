export const DATABASE_URL =
  "postgresql://neondb_owner:npg_rBT0l7AMoVme@ep-cold-tree-a1bwfuag-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;
