export default async function handler(req, res) {

  // Allow requests from your frontend (CORS setup).
  const allowedOrigins = [
    "https://cybrok3.github.io",
    "http://localhost/cybrok3.github.io"
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { device_id } = req.query;
  const authHeader = req.headers.authorization;

  if (!device_id) {
    return res.status(400).json({ error: 'Missing device_id' });
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const accessToken = authHeader.replace("Bearer ", "");  

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  try {

    // Fetch tracks from your playlist
    const playlistId = process.env.SPOTIFY_VIVES_PLAYLIST_ID;
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return res.status(500).json({ error: 'No tracks found in playlist.' });
    }

    // Pick a random track from playlist
    const tracks = playlistData.items;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const randomTrack = tracks[randomIndex]?.track;

    if (!randomTrack || !randomTrack.uri) {
      return res.status(500).json({ error: 'No track found at random index.' });
    }

    // Play the random track on the device
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