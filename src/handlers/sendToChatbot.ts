import "../utils/bootstrap";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import RedditPost from "../models/RedditPost";
import {
  createDocumentSender,
  mapToChatbotConfig,
} from "../services/ChatbotService";
import { Subreddit } from "../enums";
import { formatDate, sub } from "date-fns";
import { generatePdf } from "../utils/pdf";
import { BadRequestError } from "../utils/errors";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const subreddit = event.pathParameters?.subreddit;
    const body = JSON.parse(event.body || "{}");
    const app = body.app || "default";
    const date = body.date;
    if (!Object.values(Subreddit).includes(subreddit as Subreddit)) {
      throw new BadRequestError("Subreddit is required");
    }
    if (!body?.app) {
      throw new BadRequestError("App is required");
    }
    if (!body?.date) {
      throw new BadRequestError("Date is required");
    }

    // TODO: DOWNLOAD PDF FROM S3
    // For now, we will generate the PDF again and send it to the chatbot
    const topPosts = await RedditPost.find({ subreddit, capturedAt: date });
    console.log("Top posts:", topPosts);
    const pdfBuffer = await generatePdf(
      formatDate(new Date(date), "dd-MMM-yyyy"),
      topPosts,
    );

    const config = mapToChatbotConfig(app, subreddit as Subreddit);
    if (!config) {
      throw new BadRequestError("Invalid app or subreddit");
    }
    const response = createDocumentSender(app, config).sendDocument(
      config.chatId!,
      pdfBuffer,
      date,
      subreddit!,
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent to chatbot", response }),
    };
  } catch (error) {
    console.error("Error occurred:", error);

    // Handle custom errors
    if (error instanceof BadRequestError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message }),
      };
    }

    // Handle unexpected errors
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
