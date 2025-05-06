import mongoose, { Schema, Document } from "mongoose";

// Define the interface for a Reddit post document
export interface RedditPostInterface extends Document {
  subreddit: string;
  title: string;
  author: string;
  url: string;
  score: number;
  createdAt: Date;
  capturedAt: Date;
  rawData: Record<string, any>; // Store raw attributes for further processing
}

// Define the schema for the Reddit post
const RedditPostSchema: Schema = new Schema(
  {
    subreddit: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    url: { type: String, required: true },
    score: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    capturedAt: { type: Date, default: Date.now },
    rawData: { type: Schema.Types.Mixed, required: true }, // Store raw JSON data
  },
  {
    timestamps: true,
  },
);

// Create and export the model
const RedditPost = mongoose.model<RedditPostInterface>(
  "RedditPost",
  RedditPostSchema,
);
export default RedditPost;
