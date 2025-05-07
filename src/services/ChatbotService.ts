import { TelegramSender } from "./chatbots/TelegramSender";
import { DocumentSender } from "./chatbots/DocumentSender";
import { Subreddit } from "../enums";

export const createDocumentSender = (
  platform: "telegram",
  config: any,
): DocumentSender => {
  switch (platform) {
    case "telegram":
      return TelegramSender(config.botToken);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

export const mapToChatbotConfig = (app: "telegram", subreddit: Subreddit) => {
  const config = {
    telegram: {
      memes: {
        botToken: process.env.TELEGRAM_MEME_BOT_TOKEN,
        chatId: process.env.TELEGRAM_MEME_CHAT_ID,
      },
    },
  };

  return config[app][subreddit];
};
