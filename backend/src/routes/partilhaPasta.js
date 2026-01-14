import express from "express";
import mongoose from "mongoose";
import PartilhaPasta from "../models/PartilhaPasta.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// -----------------------------
// LISTAR PARTILHAS DE UMA PASTA
// GET /api/partpastas/pasta/:pastaId
// -----------------------------
router.get("/pasta/:pastaId", auth, async (req, res) => {
  try {
    const { pastaId } = req.params;

    // Verificar se sou dono da pasta
    // (Apenas o dono deve ver quem tem acesso? Ou todos com acesso?)
    // Por privacidade, talvez apenas o dono.
    // Mas para colaborar, é util ver quem está.

    // Simplificação: vamos buscar todas as partilhas desta pasta
    // Populate utilizadorId para saber o nome/email
    const partilhas = await PartilhaPasta.find({ pastaId }).populate("utilizadorId", "nome email");
    res.json(partilhas);
  } catch (err) {
    console.error("Erro ao listar partilhas:", err);
    res.status(500).json({ message: "Erro ao listar partilhas" });
  }
});

// CREATE
router.post("/create", auth, async (req, res) => {
  try {
    const { pastaId, utilizadorId, permissaoId } = req.body;

    if (!pastaId || !utilizadorId || !permissaoId) {
      return res.status(400).json({ message: "Campos incompletos" });
    }

    if (
      !mongoose.isValidObjectId(pastaId) ||
      !mongoose.isValidObjectId(utilizadorId) ||
      !mongoose.isValidObjectId(permissaoId)
    ) {
      return res.status(400).json({ message: "IDs inválidos" });
    }

    const nova = await PartilhaPasta.create({ pastaId, utilizadorId, permissaoId });
    return res.status(201).json(nova);
  } catch (err) {
    console.error("Erro ao criar partilha:", err);
    if (err?.code === 11000) return res.status(409).json({ message: "Partilha já existe (pastaId + utilizadorId)" });
    return res.status(500).json({ message: "Erro ao criar partilha" });
  }
});

// UPDATE
router.patch("/update/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissaoId } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID inválido" });
    if (!permissaoId || !mongoose.isValidObjectId(permissaoId)) {
      return res.status(400).json({ message: "permissaoId inválido" });
    }

    const updated = await PartilhaPasta.findByIdAndUpdate(
      id,
      { permissaoId },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Partilha não encontrada" });
    return res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar partilha:", err);
    return res.status(500).json({ message: "Erro ao atualizar partilha" });
  }
});

// DELETE
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID inválido" });

    const deleted = await PartilhaPasta.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Partilha não encontrada" });

    return res.json({ message: "Partilha eliminada com sucesso", id: deleted._id });
  } catch (err) {
    console.error("Erro ao eliminar partilha:", err);
    return res.status(500).json({ message: "Erro ao eliminar partilha" });
  }
});

export default router;
