import mongoose, { Schema, Document } from "mongoose";

export interface IReaction extends Document {
    user: mongoose.Types.ObjectId;
    video: mongoose.Types.ObjectId;
    type: 'like' | 'dislike';
    createdAt: Date;
}

const ReactionSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        type: {
            type: String,
            enum: ["like", "dislike"],
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure a user can only have one reaction per video
ReactionSchema.index({ user: 1, video: 1 }, { unique: true });

export default mongoose.model<IReaction>("Reaction", ReactionSchema);
