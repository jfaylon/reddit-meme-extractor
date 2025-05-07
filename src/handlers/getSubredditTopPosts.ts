import "../utils/bootstrap";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { fetchTopPosts } from "../services/RedditService";
import { format, parseISO } from "date-fns";
import { BadRequestError } from "../utils/errors";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const subreddit = event.pathParameters?.subreddit;
    const limit = Number(event.queryStringParameters?.limit) || 20;
    const capturedAt = event.queryStringParameters?.date;

    if (!subreddit) {
      throw new BadRequestError("Subreddit is required");
    }
    let formattedDate: string;

    if (capturedAt) {
      // Validate and format the capturedAt date
      try {
        const parsedDate = parseISO(capturedAt);
        formattedDate = format(parsedDate, "yyyy-MM-dd");
      } catch {
        throw new BadRequestError(
          "Invalid capturedAt date format. Use ISO format (YYYY-MM-DD).",
        );
      }
    } else {
      // Default to the current date if no capturedAt is provided
      const currentDate = new Date();
      formattedDate = format(currentDate, "yyyy-MM-dd");
    }
    logger.info("Formatted date:", formattedDate);
    const data = await fetchTopPosts(subreddit, limit, formattedDate);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    logger.error("Error fetching posts:", error);

    if (error instanceof BadRequestError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
