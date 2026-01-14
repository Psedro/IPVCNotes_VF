// routes/permissoes.routes.js
import express from "express";
import mongoose from "mongoose";
import Permissao from "../models/Permissao.js";
import auth from "../middleware/auth.js";
const router = express.Router();


// -----------------------------
// GET /api/permissoes
// Listar todas as permissões
// -----------------------------
router.get("/", auth, async (req, res) => {
  try {
    const permissoes = await Permissao.find();
    res.json(permissoes);
  } catch (err) {
    console.error("Erro ao listar permissões:", err);
    res.status(500).json({ message: "Erro ao listar permissões" });
  }
});

// -----------------------------
// POST /api/permissoes/create
// Body: { permissao: "ADMIN" }
// -----------------------------
router.post("/create", auth, async (req, res) => {
  try {
    const { permissao } = req.body;

    if (!permissao) {
      return res.status(400).json({ message: "A permissão é obrigatória" });
    }

    const nova = await Permissao.create({ permissao });

    return res.status(201).json(nova);
  } catch (err) {
    console.error("Erro ao criar permissão:", err);

    if (err?.code === 11000) {
      return res.status(409).json({ message: "Essa permissão já existe" });
    }

    return res.status(500).json({ message: "Erro ao criar permissão" });
  }
});

// -----------------------------
// 🔹 ELIMINAR PERMISSÃO POR ID
// DELETE /api/permissoes/delete/:id
// -----------------------------
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const deleted = await Permissao.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Permissão não encontrada" });
    }

    return res.json({ message: "Permissão eliminada com sucesso", id: deleted._id });
  } catch (err) {
    console.error("Erro ao eliminar permissão:", err);
    return res.status(500).json({ message: "Erro ao eliminar permissão" });
  }
});

export default router;
