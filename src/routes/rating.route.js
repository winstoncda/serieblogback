import express from "express";
import { addOrUpdateRating } from "../controllers/rating.controller.js";
import { protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router.post("/:blogId", protect, addOrUpdateRating);

export default router;
