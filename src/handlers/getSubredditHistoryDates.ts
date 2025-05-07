import "../utils/bootstrap";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import RedditPost from "../models/RedditPost";
import { BadRequestError, NotFoundError } from "../utils/errors";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const subreddit = event.pathParameters?.subreddit;
    if (!subreddit) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Subreddit is required" }),
      };
    }
    const dates = await RedditPost.distinct("capturedAt", {
      subreddit,
    });
    const sortedDates = dates.sort((a: string, b: string) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    if (!dates || dates.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No dates found for this subreddit" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(sortedDates),
    };
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: (error as Error).message,
      }),
    };
  }
};
