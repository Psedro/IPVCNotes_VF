import express from "express";
import EditRequest from "../models/EditRequest.js";
import PartilhaPasta from "../models/PartilhaPasta.js";
import Permissao from "../models/Permissao.js";
import Pasta from "../models/Pasta.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/edit-requests/request/:pastaId
router.post("/request/:pastaId", auth, async (req, res) => {
    try {
        const { pastaId } = req.params;

        // Check if pasta exists and is public
        const pasta = await Pasta.findById(pastaId);
        if (!pasta) return res.status(404).json({ message: "Pasta not found" });
        if (!pasta.isPublic) return res.status(403).json({ message: "Folder is not public" });

        // Check if request already exists
        const existing = await EditRequest.findOne({
            pastaId,
            requesterId: req.userId,
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ message: "Request already pending" });
        }

        const newRequest = await EditRequest.create({
            pastaId,
            requesterId: req.userId,
            ownerId: pasta.pastaDono
        });

        res.status(201).json(newRequest);
    } catch (err) {
        console.error("Error creating edit request:", err);
        res.status(500).json({ message: "Error creating request" });
    }
});

// GET /api/edit-requests/notifications
// Get pending requests where I am the owner
router.get("/notifications", auth, async (req, res) => {
    try {
        const requests = await EditRequest.find({
            ownerId: req.userId,
            status: 'pending'
        })
            .populate("requesterId", "nome email")
            .populate("pastaId", "nome")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

// PUT /api/edit-requests/respond/:requestId
router.put("/respond/:requestId", auth, async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const { requestId } = req.params;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const request = await EditRequest.findOne({ _id: requestId, ownerId: req.userId });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = status;
        await request.save();

        if (status === 'accepted') {
            // Add permission
            // Find permission "editor" (or whatever name you assume, or create if not exists)
            // For now, let's assume we want to give 'editor' role.
            // We need to look up permission ID for 'editor'.

            let editorPerm = await Permissao.findOne({ permissao: "editor" });
            if (!editorPerm) {
                // Fallback or create? Maybe assume it exists as per previous plan.
                // If not exists, maybe 'admin'?
                // Let's try to find 'editor', if fails, find 'admin', if fails create 'editor'
                editorPerm = await Permissao.findOne({ permissao: "admin" }); // legacy support
            }

            if (!editorPerm) {
                // Create if really not exists (should act as seed)
                editorPerm = await Permissao.create({ permissao: "editor" });
            }

            // Check if share already exists (maybe they had read access?)
            // If PartilhaPasta has unique index on pastaId+utilizadorId, we should check first.
            const existingShare = await PartilhaPasta.findOne({
                pastaId: request.pastaId,
                utilizadorId: request.requesterId
            });

            if (existingShare) {
                existingShare.permissaoId = editorPerm._id;
                await existingShare.save();
            } else {
                await PartilhaPasta.create({
                    pastaId: request.pastaId,
                    utilizadorId: request.requesterId,
                    permissaoId: editorPerm._id
                });
            }
        }

        res.json(request);
    } catch (err) {
        console.error("Error responding to request:", err);
        res.status(500).json({ message: "Error responding to request" });
    }
});

export default router;
