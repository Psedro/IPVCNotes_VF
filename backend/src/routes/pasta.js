import express from "express";
import Pasta from "../models/Pasta.js";
import PartilhaPasta from "../models/PartilhaPasta.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const normalizePerm = (p) => {
	if (!p) return "none";
	const v = String(p).trim().toLowerCase();
	if (v === "leitor") return "reader";
	if (v === "editor") return "editor";
	if (v === "reader" || v === "editor" || v === "admin") return v;
	return v;
};


// --------------------------
// GET /api/pastas
// Listar pastas do utilizador
// --------------------------
router.get("/", auth, async (req, res) => {
	try {
		// 1. Pastas do próprio utilizador (populate pastaDono para ter o nome)
		const minhas = await Pasta.find({ pastaDono: req.userId }).populate("pastaDono", "nome email");

		// 2. Pastas partilhadas com o utilizador
		// Populate pastaId e, dentro dele, pastaDono
		const partilhas = await PartilhaPasta.find({ utilizadorId: req.userId })
			.populate({
				path: "pastaId",
				populate: { path: "pastaDono", select: "nome email" }
			});

		// Extrair apenas as pastas das partilhas e remover nulos
		const partilhadas = partilhas
			.map(p => p.pastaId)
			.filter(p => p !== null);

		const minhasComFlag = minhas.map(p => ({ ...p.toObject(), isShared: false }));
		const partilhadasComFlag = partilhadas.map(p => ({ ...p.toObject(), isShared: true }));

		const todas = [...minhasComFlag, ...partilhadasComFlag];

		todas.sort((a, b) => new Date(b.criacaoDt) - new Date(a.criacaoDt));

		res.json(todas);
	} catch (err) {
		console.error("Erro ao listar pastas:", err);
		res.status(500).json({ message: "Erro ao listar pastas" });
	}
});

// --------------------------
// POST /api/pastas
// Criar uma nova pasta
// --------------------------
router.post("/create", auth, async (req, res) => {
	try {
		const { nome } = req.body;

		if (!nome) {
			return res.status(400).json({ message: "O nome é obrigatório" });
		}

		const nova = await Pasta.create({
			nome,
			pastaDono: req.userId,   // vem do token JWT
			criacaoDt: new Date()
		});

		res.status(201).json(nova);
	} catch (err) {
		console.error("Erro ao criar pasta:", err);
		res.status(500).json({ message: "Erro ao criar pasta" });
	}
});

// Update /api/pastas/update/:id
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({ message: "O nome é obrigatório" });
    }

    const updated = await Pasta.findOneAndUpdate(
      { _id: id, pastaDono: req.userId },       // só atualiza se pertencer ao utilizador
      { $set: { nome: nome.trim() } },          // campos a atualizar
      { new: true, runValidators: true }        // devolve o doc atualizado + valida schema
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Pasta não encontrada ou sem permissão" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar pasta:", err);
    return res.status(500).json({ message: "Erro ao atualizar pasta" });
  }
});



// DELETE /api/pastas/delete/:id
router.delete("/delete/:id", auth, async (req, res) => {
	try {
		const { id } = req.params;

		// apaga só se a pasta existir e pertencer ao utilizador autenticado
		const deleted = await Pasta.findOneAndDelete({
			_id: id,
			pastaDono: req.userId
		});

		if (!deleted) {
			return res.status(404).json({ message: "Pasta não encontrada ou sem permissão" });
		}

		return res.json({ message: "Pasta eliminada com sucesso", id: deleted._id });
	} catch (err) {
		console.error("Erro ao eliminar pasta:", err);
		return res.status(500).json({ message: "Erro ao eliminar pasta" });
	}
});



// --------------------------
// GET /api/pastas/public
// Listar todas as pastas publicas (com filtro de nome opcional)
// --------------------------
router.get("/public", auth, async (req, res) => {
	try {
		const { search } = req.query;
		let query = { isPublic: true };

		if (search) {
			query.nome = { $regex: search, $options: "i" };
		}

		const publicas = await Pasta.find(query)
			.populate("pastaDono", "nome email")
			.sort({ criacaoDt: -1 });

		res.json(publicas);
	} catch (err) {
		console.error("Erro ao listar pastas publicas:", err);
		res.status(500).json({ message: "Erro ao listar pastas publicas" });
	}
});

// --------------------------
// PUT /api/pastas/publish/:id
// Tornar pasta publica
// --------------------------
router.put("/publish/:id", auth, async (req, res) => {
	try {
		const pasta = await Pasta.findOne({ _id: req.params.id, pastaDono: req.userId });
		if (!pasta) {
			return res.status(404).json({ message: "Pasta nao encontrada ou sem permissao" });
		}

		pasta.isPublic = true;
		await pasta.save();

		res.json(pasta);
	} catch (err) {
		console.error("Erro ao publicar pasta:", err);
		res.status(500).json({ message: "Erro ao publicar pasta" });
	}
});

// --------------------------
// PUT /api/pastas/unpublish/:id
// Tornar pasta privada
// --------------------------
router.put("/unpublish/:id", auth, async (req, res) => {
	try {
		const pasta = await Pasta.findOne({ _id: req.params.id, pastaDono: req.userId });
		if (!pasta) {
			return res.status(404).json({ message: "Pasta nao encontrada ou sem permissao" });
		}

		pasta.isPublic = false;
		await pasta.save();

		res.json(pasta);
	} catch (err) {
		console.error("Erro ao despublicar pasta:", err);
		res.status(500).json({ message: "Erro ao despublicar pasta" });
	}
});


// --------------------------
// GET /api/pastas/:id
// Obter detalhes da pasta e permissões
// --------------------------
router.get("/:id", auth, async (req, res) => {
	try {
		const { id } = req.params;

		// Check format of ID to avoid casting error if it accidentally matched something else (though /public is handled before if placed correctly)
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ message: "ID inválido" });
		}

		const pasta = await Pasta.findById(id).populate("pastaDono", "nome email");

		if (!pasta) {
			return res.status(404).json({ message: "Pasta não encontrada" });
		}

		// Check permissions
		let permission = "none";
		if (pasta.pastaDono._id.toString() === req.userId) {
			permission = "owner";
		} else {
			// Check share
			const share = await PartilhaPasta.findOne({
				pastaId: id,
				utilizadorId: req.userId
			}).populate("permissaoId");

			if (share) {
				permission = normalizePerm(share.permissaoId?.permissao); // "editor", "leitor", "admin", etc.
			}
		}

		if (permission === "none" && !pasta.isPublic) {
			return res.status(403).json({ message: "Acesso negado" });
		}

		// Return folder + computed permission
		res.json({
			...pasta.toObject(),
			userPermission: permission
		});

	} catch (err) {
		console.error("Erro ao obter pasta:", err);
		res.status(500).json({ message: "Erro ao obter pasta" });
	}
});

export default router;

