# Snake on Vercel

Classic Snake with a shared leaderboard backed by Vercel serverless functions and Neon Postgres.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Neon database and copy its connection string.

3. Add a local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Put your Neon connection string in `.env.local`:

   ```bash
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```

5. Run the app with Vercel so `/api` routes work:

   ```bash
   vercel dev
   ```

6. Open the local URL shown by Vercel.

## Vercel setup

1. Create a Neon project and copy the `DATABASE_URL`.
2. In Vercel, add `DATABASE_URL` as an environment variable for your project.
3. Deploy the repo to Vercel.
4. The API will create the `snake_scores` table automatically on first request.

## API

- `GET /api/scores` returns the top 10 scores.
- `POST /api/scores` accepts `{ "username": "Ada", "score": 12 }`.
