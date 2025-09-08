import User from "../models/user.schema.js";
import TempUser from "../models/tempuser.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "../email/email.js";
import dotenv from "dotenv";

dotenv.config();

const createTokenEmail = (email) => {
  return jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "120s" });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUserMail = await User.findOne({ email });
    const existingUserPseudo = await User.findOne({ username });
    const existingTempUserMail = await TempUser.findOne({ email });
    const existingTempUserPseudo = await TempUser.findOne({ username });

    if (existingUserMail || existingUserPseudo) {
      return res.status(400).json({ message: "Déjà inscrit" });
    } else if (existingTempUserMail || existingTempUserPseudo) {
      return res.status(400).json({ message: "Vérifiez vos email" });
    }

    const token = createTokenEmail(email);
    await sendConfirmationEmail(email, token);

    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUser = new TempUser({
      username,
      email,
      password: hashedPassword,
      token,
    });
    await tempUser.save();
    res.status(200).json({
      message:
        "Veuillez confirmer votre inscription en consultant votre boite mail",
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  const { data, password } = req.body;

  // 1 - vérifier en console si je récupère les données
  console.log(req.body);

  // 2 - Véification des données

  let user;

  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (emailRegex.test(data)) {
    user = await User.findOne({ email: data });
  } else {
    user = await User.findOne({ username: data });
  }

  if (!user) {
    return res
      .status(400)
      .json({ message: "Email ou nom d'utilisateur incorrect" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Mot de passe incorrect" });
  }
  // 3 - ajout des données

  const token = jwt.sign({}, process.env.SECRET_KEY, {
    subject: user._id.toString(),
    expiresIn: "7d",
    algorithm: "HS256",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // 4 - envoi données et/ou message front
  res.status(200).json({ user, message: "Connexion réussie" });
};

export const verifyMail = async (req, res) => {
  const { token } = req.params;
  console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const tempUser = await TempUser.findOne({ email: decoded.email, token });
    console.log(tempUser);

    if (!tempUser) {
      return res.redirect(
        `${
          process.env.MODE === "development"
            ? process.env.CLIENT_URL
            : process.env.DEPLOY_FRONT_URL
        }/register?message=error`
      );
    }

    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
    });
    await newUser.save();
    await TempUser.deleteOne({ email: tempUser.email });
    res.redirect(
      `${
        process.env.MODE === "development"
          ? process.env.CLIENT_URL
          : process.env.DEPLOY_FRONT_URL
      }/register?message=success`
    );
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.redirect(
        `${
          process.env.MODE === "development"
            ? process.env.CLIENT_URL
            : process.env.DEPLOY_FRONT_URL
        }/register?message=error`
      );
    }
  }
};

export const currentUser = async (req, res) => {
  const { token } = req.cookies;
  // console.log(token);

  if (token) {
    try {
      // vérifie en décodant le token avec la clé secrète
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

      console.log(decodedToken);

      // Récupère l'utilisateur en se servant de l'ID du token
      const currentUser = await User.findById(decodedToken.sub);

      console.log(currentUser);

      if (currentUser) {
        res.status(200).json(currentUser);
      } else {
        res.status(400).json(null);
      }
    } catch (error) {
      res.status(400).json(null);
    }
  } else {
    res.status(400).json(null);
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.status(200).json({ message: "Déconnexion réussie" });
};
