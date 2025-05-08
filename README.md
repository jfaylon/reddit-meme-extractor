# Reddit Meme Extractor

A serverless application to extract and persist memes from Reddit, with support for sending reports to Telegram.

## Tech Stack & Tooling

| Tool                  | Version        |
|----------------------|----------------|
| Node.js               | 22.15.0        |
| Serverless Framework  | 3.x            |
| TypeScript            | 5.x            |
| AWS Lambda runtime    | nodejs22.x     |
| MongoDB (replica set) | 7.x (Docker)   |
| Telegram Bot Framework | Telegraf 4.x   |

### Note
- This repository utilises the `serverless-offline` plugin to simulate AWS API Gateway + Lambda locally during development. No actual AWS resources are deployed.

---

## Project Description

This application fetches the top memes from a subreddit (default past 24 hours), stores them in MongoDB, and provides an API to retrieve memes. Optionally, it can send a report as a file via a Telegram bot to a specified channel or chat.

Built for AWS Lambda with the Serverless Framework, using TypeScript.

---

## Setup Instructions

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/your-username/reddit-meme-extractor.git
cd reddit-meme-extractor
\`\`\`

### 2. Install Node.js (if not already installed)

This project requires **Node.js v22.15.0** or higher.

You can download Node.js from [https://nodejs.org/en/download](https://nodejs.org/en/download)

To verify your installation:

\`\`\`bash
node --version
npm --version
\`\`\`

Other methods to install node.js:
- via brew (MacOS)

---

### 3. Install dependencies

\`\`\`bash
npm install
\`\`\`

---

### 4. MongoDB Setup (using Docker)

Run MongoDB as a replica set in Docker:

\`\`\`bash
docker run -d --name mongodb \
  -p 27017:27017 \
  --restart unless-stopped \
  mongo --replSet rs0
\`\`\`

#### 5. **Initiate the Replica Set:**

\`\`\`bash
docker exec -it mongodb mongosh
\`\`\`

Inside the mongo shell, run the following commands:

\`\`\`javascript
rs.initiate();
cfg = rs.conf();
cfg.members[0].host = "localhost:27017"; // or your machine IP
rs.reconfig(cfg, { force: true });
\`\`\`

Database will be accessible at \`mongodb://localhost:27017/?replicaSet=rs0\`

---

### 6. Reddit API Setup

Prerequisite: A Reddit user account must be created.
Create a Reddit app at [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps):

- Select **script** type
- Fill **redirect URI** as \`http://localhost\`
- Get **client ID** and **secret**

---

### 7. Telegram Bot Setup

Prerequisite: A telegram account must be created.
1. Chat with [@BotFather](https://t.me/BotFather) to create a new bot.
2. Save the generated **bot token**.
3. Add the bot to a **channel or group** where you want it to send reports.
4. Get the **chat ID**:
   - For a private channel:  
     Use an API like \`https://api.telegram.org/bot<token>/getUpdates\` after sending a test message in the channel.
   - For a public channel:  
     Use \`@channelusername\`.

Make the bot an **admin** in the channel if sending documents.

---

### 8. Environment Variables

Create a \`.env\` file:

\`\`\`env
PORT=8000
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
MONGODB_URI=mongodb://localhost:27017/?replicaSet=rs0 
MONGODB_DATABASE=redditPosts
TELEGRAM_MEME_BOT_TOKEN=
TELEGRAM_MEME_CHAT_ID=
\`\`\`

Alternatively export variables manually.

OR

Copy the .env.example file to become .env

```bash
cp .env.example .env
```

---

## Running the application

### Local development

\`\`\`bash
npx serverless offline
\`\`\`

## Project Structure

\`\`\`
src/
 ├── handlers/        # Lambda function handlers
 ├── services/        # Reddit + MongoDB + Telegram logic
 ├── utils/           # Utility functions
serverless.ts         # Serverless Framework config
package.json
tsconfig.json
\`\`\`

---

## API Documentation

The following HTTP API endpoints are deployed via AWS API Gateway using `httpApi` with AWS Lambda handlers.

Base URL (locally with serverless offline):

```
http://localhost:8000
```

### Note
- Port can be changed in the configuration

---

### GET `/reddit/{subreddit}`

**Description:**  
Fetches the top posts from the specified subreddit.

**Path Parameters:**

| Param      | Description              | Example    |
|------------|--------------------------|------------|
| subreddit  | Name of the subreddit     | memes      |

**Query Parameters:**

| Param      | Description                 | Default | Example |
|------------|-----------------------------|---------|---------|
| limit      | Number of posts to retrieve  | 20      | 20       |

**Example Request:**

```
GET /reddit/memes
```

**Example Response:**

```json
[
  {
    "title": "Funny meme",
    "author": "author",
    "score": 1234,
    "url": "https://reddit.com/r/memes/comments/abc123/funny_meme/",
    "rank": 1,
    "rawData": {...},
    "images": [{...}]
  },
  ...
]
```

---

### GET `/reddit/{subreddit}/dates`

**Description:**  
Retrieves a list of unique dates for which data has been collected for the given subreddit.

**Path Parameters:**

| Param      | Description              | Example    |
|------------|--------------------------|------------|
| subreddit  | Name of the subreddit     | memes      |

**Example Request:**

```
GET /reddit/memes/dates
```

**Example Response:**

```json
[
  "2024-05-06",
  "2024-05-05",
  "2024-05-04"
]
```

---

### GET `/reddit/{subreddit}/pdf`

**Description:**  
Generates a PDF report of the top posts for the specified subreddit.

**Path Parameters:**

| Param      | Description              | Example    |
|------------|--------------------------|------------|
| subreddit  | Name of the subreddit     | memes      |

**Query Parameters:**

| Param      | Description                 | Default | Example |
|------------|-----------------------------|---------|---------|
| date       | Date for the report (YYYY-MM-DD) | today | 2024-05-06 |

**Example Request:**

```
GET /reddit/memes/pdf?date=2024-05-06
```

**Response:**

Returns a **PDF file as `application/pdf`**.

---

### POST `/reddit/{subreddit}/pdf/chatbot`

**Description:**  
Sends the generated PDF report to a Telegram chatbot.

**Path Parameters:**

| Param      | Description              | Example    |
|------------|--------------------------|------------|
| subreddit  | Name of the subreddit     | memes      |

**Example Request:**

```
POST /reddit/memes/pdf/chatbot
```

**Request Body:**

```json
{
  "app": "telegram",
  "date": "2025-05-06"
}
```

**Example Response:**

```json
{
  "response": ...,
  "message": "Message sent to chatbot"
}
```

---


## Assumptions
- The system takes a snapshot of the day's top results at the time the client requests for it and saves it into the database. Changes throughout the day may not be saved.
- Using serverless@3 does not require a login.
- Telegram and Reddit accounts and their keys and secrets are needed to be created.
- While web crawling is against Reddit's Terms of Service (TOS), this project uses the official Reddit API to retrieve data. Two methods are available: unauthenticated (public) requests or authenticated requests using a client ID and secret. It is recommended to use authenticated requests to reduce risk of rate limiting or request blocking.


## Possible Improvements
- Based on the assumption of the snapshot saving. The system can create a cronjob to retrieve/update the results with fixed intervals
- Other subreddits may be considered to be retrieved.
- Other chatbots other than Telegram can be developed.
- Rather than a direct hit from the database, installation of caches such as Redis may be used.
- Since this is developed only on the local environment via serverless-offline, implementation to actual server instances may be configured.
- The data saved has a raw attribute which contains the raw data from Reddit. The data may be used/reprocessed in the near future as requirements change.
- Add unit testing to improve reliability