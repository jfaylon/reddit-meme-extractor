import "../utils/bootstrap";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import RedditPost from "../models/RedditPost";
import { formatDate } from "date-fns";
import { generatePdf } from "../utils/pdf";
import { Subreddit } from "../enums";
import { BadRequestError } from "../utils/errors";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const date = event.queryStringParameters?.date;
    const subreddit = event.pathParameters?.subreddit;
    if (!Object.values(Subreddit).includes(subreddit as Subreddit)) {
      throw new BadRequestError("Subreddit is required");
    }
    if (!date) {
      throw new BadRequestError("Date is required");
    }

    const topPosts = await RedditPost.find({ subreddit, capturedAt: date });
    logger.info("Top posts:", topPosts);
    const pdfBuffer = await generatePdf(
      formatDate(new Date(date), "dd-MMM-yyyy"),
      topPosts,
    );

    // TODO: UPLOAD PDF TO S3

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=report.pdf",
      },
      body: pdfBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    logger.error("Error generating PDF:", error);
    if (error instanceof BadRequestError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate PDF" }),
    };
  }
};
