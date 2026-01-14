import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import pastaRoutes from "./routes/pasta.js";
import notaRoutes from "./routes/nota.js";
import permRoutes from "./routes/permissao.js";
import partpastasRoutes from "./routes/partilhaPasta.js";
import editRequestRoutes from "./routes/editRequest.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/pastas", pastaRoutes);
app.use("/api/notas", notaRoutes);
app.use("/api/permissoes", permRoutes);
app.use("/api/partpastas", partpastasRoutes);
app.use("/api/edit-requests", editRequestRoutes);
app.use("/api/upload", uploadRoutes);

// ---- Mongo com cache (serverless safe) ----
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ---- Handler Vercel ----
export default async function handler(req, res) {
  await connectMongo();
  return app(req, res);
}
