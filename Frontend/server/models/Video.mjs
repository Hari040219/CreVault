import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: false,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: '',
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
    // Approximate channel-level subscribers for this video's author.
    // In a full app this would live on a separate User/Channel collection.
    authorSubscribers: {
      type: Number,
      default: 0,
    },
    authorId: {
      type: String,
      required: false,
    },
    authorName: {
      type: String,
      required: false,
    },
    authorAvatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model('Video', VideoSchema);

export default Video;

