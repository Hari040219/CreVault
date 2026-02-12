import mongoose, { Schema, Document } from "mongoose";

export interface IView extends Document {
    user: mongoose.Types.ObjectId;
    video: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ViewSchema: Schema = new Schema(
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
    },
    { timestamps: true }
);

// Ensure a user can only have one view counted per video
ViewSchema.index({ user: 1, video: 1 }, { unique: true });

export default mongoose.model<IView>("View", ViewSchema);
