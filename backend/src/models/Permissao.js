import mongoose from "mongoose";

const permissaoSchema = new mongoose.Schema(
	{
		permissao: { type: String, required: true },
	},
);

const Permissao = mongoose.model("Permissao", permissaoSchema, "Permissao");

export default Permissao;