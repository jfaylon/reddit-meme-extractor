export interface DocumentSender {
  sendDocument(
    chatId: string,
    buffer: Buffer,
    date: string,
    subreddit: string,
  ): Promise<void>;
}
