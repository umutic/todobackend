import express from "express";
import { db } from "../config/firebase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ÜRÜN OLUŞTUR
router.post("/", authMiddleware, async (req, res) => {
  const { name, description, price } = req.body;

  const ref = await db.collection("products").add({
    name,
    description,
    price,
    userId: req.user.userId,
  });

  res.json({ success: true, productId: ref.id });
});

// SADECE KENDİ ÜRÜNLERİNİ LİSTELE
router.get("/", authMiddleware, async (req, res) => {
  const snapshot = await db.collection("products")
    .where("userId", "==", req.user.userId)
    .get();

  const products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.json(products);
});

// TEK ÜRÜN
router.get("/:id", authMiddleware, async (req, res) => {
  const doc = await db.collection("products").doc(req.params.id).get();

  if (!doc.exists) return res.json({ error: "Ürün yok" });

  if (doc.data().userId !== req.user.userId)
    return res.status(403).json({ error: "Yetki yok" });

  res.json({ id: doc.id, ...doc.data() });
});

// GÜNCELLEME
router.put("/:id", authMiddleware, async (req, res) => {
  const docRef = db.collection("products").doc(req.params.id);
  const doc = await docRef.get();

  if (!doc.exists) return res.json({ error: "Ürün yok" });

  if (doc.data().userId !== req.user.userId)
    return res.status(403).json({ error: "Yetki yok" });

  await docRef.update(req.body);

  res.json({ success: true });
});

// SİLME
router.delete("/:id", authMiddleware, async (req, res) => {
  const docRef = db.collection("products").doc(req.params.id);
  const doc = await docRef.get();

  if (!doc.exists) return res.json({ error: "Ürün yok" });

  if (doc.data().userId !== req.user.userId)
    return res.status(403).json({ error: "Yetki yok" });

  await docRef.delete();

  res.json({ success: true });
});

export default router;