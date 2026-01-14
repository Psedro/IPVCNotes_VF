import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import pastaRoutes from "./routes/pasta.js";
import notaRoutes from "./routes/nota.js";
import permRoutes from "./routes/permissao.js";
import partpastasRoutes from "./routes/partilhaPasta.js";
import editRequestRoutes from "./routes/editRequest.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();

const app = express();

// ---------- CORS (robusto para Vercel + credentials) ----------
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : [
      "http://localhost:5173",
      "https://ipvc-notes-vf-cw4t.vercel.app",
      // se tiveres um domínio "final" diferente, mete aqui também
      // "https://ipvc-notes-vf.vercel.app" (isto é backend, normalmente não precisa)
    ];

const corsOptions = {
  origin(origin, cb) {
    // requests sem Origin (curl/postman/server-to-server)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

// Preflight sempre OK (antes das rotas)
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// -------------------------------------------------------------
app.use(express.json());

// --- Static uploads (local vs Vercel) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.VERCEL) {
  app.use("/uploads", express.static("/tmp/uploads"));
} else {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

// ---- Mongo com cache (serverless safe) ----
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectMongo() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// --- Basic routes ---
app.get("/", (_req, res) => res.status(200).send("API online ✅"));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/favicon.ico", (_req, res) => res.status(204).end());

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/pastas", pastaRoutes);
app.use("/api/notas", notaRoutes);
app.use("/api/permissoes", permRoutes);
app.use("/api/partpastas", partpastasRoutes);
app.use("/api/edit-requests", editRequestRoutes);
app.use("/api/upload", uploadRoutes);

// --- Error fallback ---
app.use((req, res) =>
  res.status(404).json({ message: "Not Found", path: req.path })
);

// ---- Handler Vercel ----
export default async function handler(req, res) {
  try {
    await connectMongo();
    return app(req, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
