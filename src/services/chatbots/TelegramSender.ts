import { Telegraf } from "telegraf";
import fs from "fs";

import { DocumentSender } from "./DocumentSender";

export const TelegramSender = (botToken: string): DocumentSender => {
  return {
    async sendDocument(
      chatId: string,
      buffer: Buffer,
      date: string,
      subreddit: string,
    ): Promise<void> {
      const bot = new Telegraf(botToken);

      try {
        await bot.telegram.sendDocument(
          chatId,
          {
            source: buffer,
            filename: `report-${date}.pdf`,
          },
          {
            caption: `The top posts from ${subreddit} on ${date}`,
          },
        );
        console.log("Document sent successfully via Telegram");
      } catch (error) {
        console.error(
          "Error sending document via Telegram:",
          (error as Error).message,
        );
      }
    },
  };
};
