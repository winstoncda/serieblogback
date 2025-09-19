import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
} from "../controllers/blog.controller.js";
import { protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/blog/:id", getBlogById);

// on passe par le middleware avant d'aller sur le controller
// si c'est valide, l'utilisateur est attaché à la requête
router.post("/", protect, createBlog);

export default router;
