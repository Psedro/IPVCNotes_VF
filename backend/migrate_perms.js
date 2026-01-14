import mongoose from "mongoose";
import dotenv from "dotenv";
import Permissao from "./src/models/Permissao.js";
import PartilhaPasta from "./src/models/PartilhaPasta.js";

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Ensure lowercase permissions exist
        let editorLower = await Permissao.findOne({ permissao: "editor" });
        if (!editorLower) {
            editorLower = await Permissao.create({ permissao: "editor" });
            console.log("Created 'editor' permission");
        }

        let leitorLower = await Permissao.findOne({ permissao: "leitor" });
        if (!leitorLower) {
            leitorLower = await Permissao.create({ permissao: "leitor" });
            console.log("Created 'leitor' permission");
        }

        // 2. Find uppercase permissions
        const editorUpper = await Permissao.findOne({ permissao: "EDITOR" });
        const leitorUpper = await Permissao.findOne({ permissao: "LEITOR" });

        // 3. Migrate references and delete upper
        if (editorUpper) {
            console.log(`Found EDITOR (${editorUpper._id}). Migrating to editor (${editorLower._id})...`);
            const res = await PartilhaPasta.updateMany(
                { permissaoId: editorUpper._id },
                { permissaoId: editorLower._id }
            );
            console.log(`Updated ${res.modifiedCount} shares.`);
            await Permissao.findByIdAndDelete(editorUpper._id);
            console.log("Deleted EDITOR.");
        }

        if (leitorUpper) {
            console.log(`Found LEITOR (${leitorUpper._id}). Migrating to leitor (${leitorLower._id})...`);
            const res = await PartilhaPasta.updateMany(
                { permissaoId: leitorUpper._id },
                { permissaoId: leitorLower._id }
            );
            console.log(`Updated ${res.modifiedCount} shares.`);
            await Permissao.findByIdAndDelete(leitorUpper._id);
            console.log("Deleted LEITOR.");
        }

        console.log("Migration finished.");
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
