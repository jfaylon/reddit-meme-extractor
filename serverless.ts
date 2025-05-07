import type { AWS } from "@serverless/typescript";
import dotenv from "dotenv";
dotenv.config();

const serverlessConfiguration: AWS = {
  service: "reddit-meme-extractor",
  frameworkVersion: "3",
  plugins: ["serverless-offline", "serverless-plugin-typescript"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    region: "ap-southeast-1",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      PORT: process.env.PORT || "8000",
      REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID || "",
      REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET || "",
    },
  },
  functions: {
    getSubredditTopPosts: {
      handler: "src/handlers/getSubredditTopPosts.handler",
      events: [
        {
          httpApi: {
            method: "get",
            path: "/reddit/{subreddit}",
          },
        },
      ],
    },
    getSubredditHistoryDates: {
      handler: "src/handlers/getSubredditHistoryDates.handler",
      events: [
        {
          httpApi: {
            method: "get",
            path: "/reddit/{subreddit}/dates",
          },
        },
      ],
    },
    generateReport: {
      handler: "src/handlers/generateReport.handler",
      events: [
        {
          httpApi: {
            method: "get",
            path: "/reddit/{subreddit}/pdf",
          },
        },
      ],
    },
    sendDocumentToChatbot: {
      handler: "src/handlers/sendToChatbot.handler",
      events: [
        {
          httpApi: {
            method: "post",
            path: "/reddit/{subreddit}/pdf/chatbot",
          },
        },
      ],
    },
  },
  custom: {
    "serverless-offline": {
      httpPort: process.env.PORT || 8000,
    },
  },
};

module.exports = serverlessConfiguration;
