import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// -----------------------------
// 🔹 REGISTAR UTILIZADOR
// POST /api/auth/register
// -----------------------------
router.post("/register", async (req, res) => {
  try {
    console.log("REQ BODY RECEBIDO:", req.body);

    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({ message: "Campos incompletos" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("UTILIZADOR JÁ EXISTE:", existing.email);
      return res.status(400).json({ message: "Email já registado" });
    }

    const passeHash = await bcrypt.hash(password, 10);
    console.log("HASH GERADO:", passeHash);

    const user = await User.create({
      nome,
      email,
      passeHash
    });

    console.log("UTILIZADOR GUARDADO:", user);

    return res.status(201).json({
      id: user._id,
      nome: user.nome,
      email: user.email
    });
  } catch (err) {
    console.error("ERRO NO REGISTO:", err);
    res.status(500).json({ message: "Erro ao registar utilizador" });
  }
});


// -----------------------------
// 🔹 LOGIN DO UTILIZADOR
// POST /api/auth/login
// -----------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // procurar utilizador
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    // comparar password
    const ok = await bcrypt.compare(password, user.passeHash);
    if (!ok) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    // gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro ao autenticar" });
  }
});

// -----------------------------
// 🔹 FIND USER BY EMAIL
// POST /api/auth/find-by-email
// -----------------------------
router.post("/find-by-email", auth, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("_id nome email");

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Erro ao procurar utilizador:", err);
    res.status(500).json({ message: "Erro ao procurar utilizador" });
  }
});

export default router;
