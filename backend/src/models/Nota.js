import mongoose from "mongoose";

const notaSchema = new mongoose.Schema(
  {
    notaPasta: { type: mongoose.Schema.Types.ObjectId, ref: "Pasta", required: true },
    notaDono: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    titulo: { type: String, required: true },
    conteudo: { type: String, required: false },
    criacaoDt: { type: Date, default: Date.now },
    ultAtualizacao: { type: Date, default: Date.now },
    anexos: [{
      nome: String,
      url: String,
      tipo: String,
      dataUpload: { type: Date, default: Date.now }
    }]
  },
);

// 3º argumento "Nota" = usa exatamente a collection Nota no MongoDB
const Nota = mongoose.model("Nota", notaSchema, "Nota");

export default Nota;
