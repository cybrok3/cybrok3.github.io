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

  if (!device_id) {
    return res.status(400).json({ error: 'Missing device_id' });
  }

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

    // 2. Fetch tracks from your playlist
    const playlistId = process.env.SPOTIFY_VIVES_PLAYLIST_ID;
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return res.status(500).json({ error: 'No tracks found in playlist.' });
    }

    // 3. Pick a random track from playlist
    const tracks = playlistData.items;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const randomTrack = tracks[randomIndex]?.track;

    if (!randomTrack || !randomTrack.uri) {
      return res.status(500).json({ error: 'No track found at random index.' });
    }

    // 4. Play the random track on the device
    const playRes = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uris: [randomTrack.uri]
      })
    });

    if (playRes.status === 204) {
      res.status(200).json({ message: `Playing ${randomTrack.name}` });
    } else {
      const errorData = await playRes.json();
      res.status(playRes.status).json({ error: errorData });
    }

  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}