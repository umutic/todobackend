import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Kullanıcı var mı?
  const snapshot = await db.collection("users")
    .where("username", "==", username)
    .get();

  if (!snapshot.empty) {
    return res.json({ error: "Kullanıcı zaten var" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const ref = await db.collection("users").add({
    username,
    password: hashed,
  });

  return res.json({ success: true, userId: ref.id });
});


// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const snapshot = await db.collection("users")
    .where("username", "==", username)
    .get();

  if (snapshot.empty) {
    return res.json({ error: "Kullanıcı bulunamadı" });
  }

  const user = snapshot.docs[0];
  const userData = user.data();

  const match = await bcrypt.compare(password, userData.password);
  if (!match) return res.json({ error: "Yanlış şifre" });

  const token = jwt.sign(
    {
      userId: user.id,
      username: userData.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    success: true,
    token,
  });
});

export default router;