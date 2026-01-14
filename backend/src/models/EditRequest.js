import mongoose from "mongoose";

const editRequestSchema = new mongoose.Schema(
    {
        pastaId: { type: mongoose.Schema.Types.ObjectId, ref: "Pasta", required: true },
        requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

// Prevent duplicate pending requests for the same folder/user
editRequestSchema.index({ pastaId: 1, requesterId: 1, status: 1 }, { unique: false });

const EditRequest = mongoose.model("EditRequest", editRequestSchema, "EditRequest");

export default EditRequest;
