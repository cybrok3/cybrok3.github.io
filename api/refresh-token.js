/**
 * API handler to securely refresh the Spotify access token using a stored refresh token.
 *
 * Spotify's access tokens are short-lived (usually 1 hour). This function uses a 
 * long-lived refresh token to request a new access token from Spotify's /api/token endpoint.
 * 
 * The access token returned is used to make authorized requests to Spotify's Web API 
 * (e.g., playing music, fetching playlists, etc.).
 *
 * This endpoint is meant to be called by your frontend when it needs a fresh token.
 * 
 * @param {import('next').NextApiRequest} req - The incoming HTTP request object which is probably coming from my backend as well.
 * @param {import('next').NextApiResponse} res - The HTTP response object to send data back.
 * @returns {Promise<void>}
 */

export default async function handler(req, res) {

  // Allow requests from your frontend (CORS setup).
  const allowedOrigins = [
    "https://cybrok3.github.io",
    "https://localhost/cybrok3.github.io",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request - not sure why.
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Spotify credentials from environment variables of my vercel backend.
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // Tell Spotify who you are and what you want and wait for it's response.
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    const data = await response.json();

    // Get the access token from the response.
    if (data.access_token) {
      res.status(200).json({ access_token: data.access_token });
    } else {
      res.status(500).json({ error: 'Token refresh failed', details: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}