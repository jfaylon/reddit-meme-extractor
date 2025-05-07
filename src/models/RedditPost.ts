import { format } from "date-fns";
import mongoose, { Schema, Document } from "mongoose";

// Define the interface for a Reddit post document
export interface RedditPostInterface extends Document {
  subreddit: string;
  title: string;
  author: string;
  url: string;
  score: number;
  createdAt: Date;
  capturedAt: string;
  rawData: Record<string, any>; // Store raw attributes for further processing
  images: Image[];
  rank: number;
}

interface Image {
  source: {
    url: string;
    width: number;
    height: number;
  };
  resolutions: Array<{
    url: string;
    width: number;
    height: number;
  }>;
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
    capturedAt: { type: String, default: format(new Date(), "yyyy-MM-dd") },
    rawData: { type: Schema.Types.Mixed, required: true }, // Store raw JSON data
    images: [
      {
        source: {
          url: { type: String, required: true },
          width: { type: Number, required: true },
          height: { type: Number, required: true },
        },
        resolutions: [
          {
            url: { type: String, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true },
          },
        ],
      },
    ],
    rank: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

RedditPostSchema.index({ subreddit: 1, capturedAt: -1 });

// Create and export the model
const RedditPost = mongoose.model<RedditPostInterface>(
  "RedditPost",
  RedditPostSchema,
);
export default RedditPost;
