import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";


import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 20, // Dakikada en fazla 20 istek
    message: { error: "Çok fazla istek attınız. Yavaşlayın." }
})


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(limiter);

app.use("/auth", authRoutes);
app.use("/products", productRoutes);

const PORT = process.env.PORT || 3000;

export default app;