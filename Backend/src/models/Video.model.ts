import mongoose, { Schema, Document } from "mongoose";

export interface IVideo extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  user: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },

    thumbnailUrl: {
      type: String,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    dislikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVideo>("Video", VideoSchema);
