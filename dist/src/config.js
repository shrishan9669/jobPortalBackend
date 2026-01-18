export const DATABASE_URL = "postgresql://neondb_owner:npg_rBT0l7AMoVme@ep-cold-tree-a1bwfuag-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
    cloud_name: "dxi4co0lo",
    api_key: "167451177569471",
    api_secret: "ZxP5posv1VpML-P5K_LBESeft1A",
});
export default cloudinary;
//# sourceMappingURL=config.js.map