import express from "express";

import userRoutes from "./user.route.js";
import blogRoutes from "./blog.route.js";
import ratingRoutes from "./rating.route.js";

const router = express.Router();

router.use("/blog", blogRoutes);
router.use("/user", userRoutes);
router.use("/rating", ratingRoutes);

export default router;
