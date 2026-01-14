import mongoose from "mongoose";
import dotenv from "dotenv";
import Permissao from "./src/models/Permissao.js";

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const perms = await Permissao.find();
        console.log("Permissions found:", perms);
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
