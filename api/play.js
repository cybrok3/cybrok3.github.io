// /api/play.js

export default async function handler(req, res) {
  const allowedOrigins = [
    "https://cybrok3.github.io",
    "http://localhost/cybrok3.github.io"
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { device_id } = req.query;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    // 1. Refresh token to get access token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Choose a track URI (or get a random one)
    const trackUri = "spotify:track:3KkXRkHbMCARz0aVfEt68P"; // Use your own logic here if needed

    // 3. Call Spotify API to play
    const playRes = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uris: [trackUri]
      })
    });

    if (playRes.status === 204) {
      res.status(200).json({ message: "Playback started" });
    } else {
      const errorData = await playRes.json();
      res.status(playRes.status).json({ error: errorData });
    }

  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}