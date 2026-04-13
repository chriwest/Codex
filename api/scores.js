import { listHighScores, saveHighScore } from "./_lib/leaderboard.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const scores = await listHighScores();
      return res.status(200).json({ scores });
    }

    if (req.method === "POST") {
      const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const result = await saveHighScore({
        username: payload?.username,
        score: payload?.score,
      });

      return res.status(201).json(result);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    return res.status(statusCode).json({
      error: statusCode === 500 ? "Failed to process leaderboard request." : error.message,
    });
  }
}
