import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Garantir que a pasta uploads existe
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do Multer (Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Nome único: timestamp + nome original (sanitizado)
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

const upload = multer({ storage });

// Rota POST /api/upload
// Aceita um campo 'file' no form-data
router.post("/", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Nenhum ficheiro enviado" });
        }

        // Construir URL completo (assumindo que o servidor serve a pasta uploads staticamente)
        // O ideal seria guardar o path relativo e no frontend montar a URL,
        // mas para facilitar vamos devolver já uma sugestão de caminho relativo.
        // O frontend depois prefixa com a URL da API, ou servimos como estático.
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            nome: req.file.originalname,
            tipo: req.file.mimetype,
            size: req.file.size
        });
    } catch (err) {
        console.error("Erro no upload:", err);
        res.status(500).json({ message: "Erro ao fazer upload" });
    }
});

export default router;
