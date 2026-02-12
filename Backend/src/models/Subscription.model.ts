import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
    subscriber: mongoose.Types.ObjectId;
    channel: mongoose.Types.ObjectId;
    createdAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure a user can only subscribe once to a channel
SubscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

export default mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
