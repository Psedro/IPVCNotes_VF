import mongoose from "mongoose";

const pastaSchema = new mongoose.Schema(
  {
    pastaDono: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nome: { type: String, required: true },
    criacaoDt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: false }
  },
);

const Pasta = mongoose.model("Pasta", pastaSchema, "Pasta");

export default Pasta;
