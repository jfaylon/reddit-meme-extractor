import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { fetchTopPosts } from "../services/RedditService";
import { format } from "date-fns";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const subreddit = event.pathParameters?.subreddit;
  const limit = Number(event.queryStringParameters?.limit) || 20;

  if (!subreddit) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Subreddit is required" }),
    };
  }

  try {
    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    const data = await fetchTopPosts(subreddit, limit, formattedDate);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
