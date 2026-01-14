import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ✅ Em Vercel só podes escrever em /tmp
const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? "/tmp/uploads" : "uploads";

// Garantir que a pasta uploads existe (recursive evita erro se já existir)
fs.mkdirSync(uploadDir, { recursive: true });

// Configuração do Multer (Storage)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// Rota POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum ficheiro enviado" });
    }

    // ⚠️ Em Vercel, o ficheiro vai para /tmp e não é persistente.
    // Se quiseres servir como URL público, tens de usar storage externo (Cloudinary/S3/Supabase).
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      url: fileUrl,
      nome: req.file.originalname,
      tipo: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ message: "Erro ao fazer upload" });
  }
});

export default router;
