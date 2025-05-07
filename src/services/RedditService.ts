import axios from "axios";
import qs from "qs";
import RedditPost, { RedditPostInterface } from "../models/RedditPost";
import { decode } from "html-entities";
import { format } from "date-fns";

const clientId = process.env.REDDIT_CLIENT_ID;
const clientSecret = process.env.REDDIT_CLIENT_SECRET;

export const getAccessToken = async (): Promise<string> => {
  const tokenUrl = "https://www.reddit.com/api/v1/access_token";
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    tokenUrl,
    qs.stringify({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data.access_token;
};

export const fetchTopPosts = async (
  subreddit: string,
  limit: number = 10,
  date: string,
) => {
  const startDate = new Date(date);
  startDate.setUTCHours(0, 0, 0, 0); // Start of the day
  const endDate = new Date(date);
  endDate.setUTCHours(23, 59, 59, 999);
  const existingTopPosts = await RedditPost.find({
    subreddit,
    capturedAt: date,
  })
    .sort({ score: -1 })
    .limit(limit);

  if (existingTopPosts.length > 0) {
    logger.info("Returning cached posts from the database");
    return existingTopPosts;
  }

  if (date !== format(new Date(), "yyyy-MM-dd")) {
    logger.info(
      "Date does not match today's date. Returning cached posts only.",
    );
    return existingTopPosts;
  }

  let url: string;
  const headers: Record<string, string> = {};
  if (clientId && clientSecret) {
    logger.info("Using Reddit API with OAuth");
    const accessToken = await getAccessToken();
    url = `https://oauth.reddit.com/r/${subreddit}/top?limit=${limit}&t=day`;
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else {
    logger.info("Using public Reddit API");
    url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=day`;
  }
  logger.info("Fetching posts from URL:", url);
  const response = await axios.get(url, { headers });
  const capturedAt = format(new Date(), "yyyy-MM-dd");
  const posts = response.data.data.children.map((post: any) => {
    const images = post.data.preview?.images?.map((image: any) => ({
      source: {
        url: decode(image.source.url), // Decode the source URL
        width: image.source.width,
        height: image.source.height,
      },
      resolutions: image.resolutions.map((res: any) => ({
        url: decode(res.url), // Decode each resolution URL
        width: res.width,
        height: res.height,
      })),
    }));

    return {
      subreddit: post.data.subreddit,
      title: post.data.title,
      author: post.data.author,
      url: decode(`https://reddit.com${post.data.permalink}`), // Decode the main post URL
      score: post.data.score,
      createdAt: new Date(post.data.created_utc * 1000), // Convert Unix timestamp to Date
      images: images || [], // Handle cases where images might be undefined
      rawData: post.data,
      capturedAt,
    };
  });

  const sortedPosts = posts.sort(
    (a: RedditPostInterface, b: RedditPostInterface) => b.score - a.score,
  );

  for (let i = 0; i < sortedPosts.length; i++) {
    sortedPosts[i].rank = i + 1;
  }

  await RedditPost.insertMany(sortedPosts);
  logger.info("Saved new posts to the database");
  return posts;
};
