import express from "express";
import Nota from "../models/Nota.js";
import Pasta from "../models/Pasta.js";
import PartilhaPasta from "../models/PartilhaPasta.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// --------------------------
// POST /api/notas
// Criar uma nova nota
// --------------------------


// --------------------------
// GET /api/notas/pasta/:pastaId
// Listar notas de uma pasta
// --------------------------
router.get("/pasta/:pastaId", auth, async (req, res) => {
  try {
    const { pastaId } = req.params;

    // Verificar se pasta existe
    const pasta = await Pasta.findById(pastaId);
    if (!pasta) return res.status(404).json({ message: "Pasta não encontrada" });

    // Verificar acesso: Sou dono OU existe partilha para mim
    const souDono = pasta.pastaDono.toString() === req.userId;
    let temAcesso = souDono;

    if (!temAcesso) {
      const partilha = await PartilhaPasta.findOne({
        pastaId: pastaId,
        utilizadorId: req.userId
      });
      if (partilha) temAcesso = true;
    }

    if (!temAcesso) {
      return res.status(403).json({ message: "Sem permissão nesta pasta" });
    }

    // Buscar notas
    const notas = await Nota.find({ notaPasta: pastaId }).sort({ ultAtualizacao: -1 });
    res.json(notas);
  } catch (err) {
    console.error("Erro ao listar notas:", err);
    res.status(500).json({ message: "Erro ao listar notas" });
  }
});

// --------------------------
// GET /api/notas/:id
// Obter uma nota específica
// --------------------------
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await Nota.findById(id).populate("notaPasta");

    if (!nota) return res.status(404).json({ message: "Nota não encontrada" });

    // Verificar acesso
    const pasta = nota.notaPasta; // populate trouxe o objeto pasta (se existir)
    // Se a pasta não existir (foi apagada?), talvez dar erro ou só validar dono da nota

    // Validação robusta: ver se sou dono da PASTA ou tenho partilha da PASTA.
    // (Nota: notaDono é quem criou a nota, mas o acesso depende da pasta normalmente)
    // Se a nota foi criada por mim, devo ter acesso? Sim.

    let temAcesso = false;

    if (nota.notaDono.toString() === req.userId) {
      temAcesso = true;
    } else if (pasta) {
      // Verificar dono da pasta
      if (pasta.pastaDono.toString() === req.userId) temAcesso = true;
      else {
        // Verificar partilha
        const partilha = await PartilhaPasta.findOne({
          pastaId: pasta._id,
          utilizadorId: req.userId
        });
        if (partilha) temAcesso = true;
      }
    }

    if (!temAcesso) return res.status(403).json({ message: "Sem permissão" });

    res.json(nota);
  } catch (err) {
    console.error("Erro ao obter nota:", err);
    res.status(500).json({ message: "Erro ao obter nota" });
  }
});

// --------------------------
// PUT /api/notas/:id
// Atualizar uma nota
// --------------------------

const normalizePerm = (p) => {
  if (!p) return "none";
  const v = String(p).trim().toLowerCase();
  if (v === "leitor") return "reader";
  if (v === "editor") return "editor";
  if (v === "reader" || v === "editor" || v === "admin") return v;
  return v;
};

const canEditByPermission = (perm) => {
  const p = normalizePerm(perm);
  return p === "editor" || p === "admin" || p === "owner";
};

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, anexos } = req.body;

    const nota = await Nota.findById(id);
    if (!nota) return res.status(404).json({ message: "Nota não encontrada" });

    const pasta = await Pasta.findById(nota.notaPasta);
    if (!pasta) return res.status(404).json({ message: "Pasta não encontrada" });

    // Dono da pasta edita sempre
    if (pasta.pastaDono.toString() === req.userId) {
      nota.titulo = titulo;
      nota.conteudo = conteudo;
      if (anexos) nota.anexos = anexos; // Atualizar anexos se enviados
      nota.ultAtualizacao = new Date();
      await nota.save();
      return res.json(nota);
    }

    // Não é dono: tem de ter partilha "editor"
    const partilha = await PartilhaPasta.findOne({
      pastaId: pasta._id,
      utilizadorId: req.userId
    }).populate("permissaoId");

    if (!partilha) {
      return res.status(403).json({ message: "Sem permissão para editar" });
    }

    const perm = partilha.permissaoId?.permissao;
    if (!canEditByPermission(perm)) {
      return res.status(403).json({ message: "Sem permissão para editar" });
    }

    nota.titulo = titulo;
    nota.conteudo = conteudo;
    if (anexos) nota.anexos = anexos;
    nota.ultAtualizacao = new Date();
    await nota.save();

    return res.json(nota);
  } catch (err) {
    console.error("Erro ao atualizar nota:", err);
    res.status(500).json({ message: "Erro ao atualizar nota" });
  }
});


// --------------------------
// POST /api/notas
// Criar uma nova nota
// --------------------------

router.post("/create/:pastaId", auth, async (req, res) => {
  try {
    const { nome, titulo, conteudo } = req.body;
    const { pastaId } = req.params; // <-- vem do link

    if (!nome) return res.status(400).json({ message: "O nome é obrigatório" });
    if (!titulo) return res.status(400).json({ message: "O título é obrigatório" });

    const novaNota = await Nota.create({
      nome,
      titulo,
      conteudo: conteudo || "",
      notaPasta: pastaId,
      notaDono: req.userId,
      criacaoDt: new Date(),
      ultAtualizacao: new Date(),
    });

    return res.status(201).json(novaNota);
  } catch (err) {
    console.error("Erro ao criar nota:", err);
    return res.status(500).json({ message: "Erro ao criar nota" });
  }
});

// --------------------------
// DELETE /api/notas/:id
// Eliminar uma nota
// --------------------------
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a nota existe
    const nota = await Nota.findById(id);
    if (!nota) return res.status(404).json({ message: "Nota não encontrada" });

    // Verificar permissão: Dono da nota ou Dono da Pasta?
    // Regra simples: Apenas o dono da nota pode apagar (ou dono da pasta).
    // Vamos assumir que quem criou a nota (notaDono) pode apagar.
    // Se o user for dono da pasta, também deveria poder apagar?
    // Vamos verificar ambos.

    let podeApagar = false;

    if (nota.notaDono.toString() === req.userId) {
      podeApagar = true;
    } else {
      // Verificar se é dono da pasta onde a nota está
      const pasta = await Pasta.findById(nota.notaPasta);
      if (pasta && pasta.pastaDono.toString() === req.userId) {
        podeApagar = true;
      }
    }

    if (!podeApagar) {
      return res.status(403).json({ message: "Sem permissão para eliminar esta nota" });
    }

    await Nota.findByIdAndDelete(id);
    return res.json({ message: "Nota eliminada com sucesso" });

  } catch (err) {
    console.error("Erro ao eliminar nota:", err);
    return res.status(500).json({ message: "Erro ao eliminar nota" });
  }
});

export default router;