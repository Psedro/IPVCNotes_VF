import mongoose from "mongoose";

const partilhaPastaSchema = new mongoose.Schema(
  {
    pastaId: { type: mongoose.Schema.Types.ObjectId, ref: "Pasta", required: true },
    utilizadorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    permissaoId: { type: mongoose.Schema.Types.ObjectId, ref: "Permissao", required: true },
    partilhaDt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// (opcional mas recomendado) não permitir duplicados (mesma pasta + mesmo utilizador)
partilhaPastaSchema.index({ pastaId: 1, utilizadorId: 1 }, { unique: true });

const PartilhaPasta = mongoose.model("PartilhaPasta", partilhaPastaSchema, "PartilhaPasta");

export default PartilhaPasta;
