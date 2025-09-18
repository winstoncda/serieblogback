import express from "express";
import {
  login,
  register,
  verifyMail,
  currentUser,
  logoutUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router.post("/", register);

router.post("/login", login);

router.get("/verifyMail/:token", verifyMail);

router.get("/current", currentUser);

router.put("/profile", protect, updateProfile);

router.delete("/deleteToken", logoutUser);

export default router;

// http://localhost:5000/user
