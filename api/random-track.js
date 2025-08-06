export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    "https://cybrok3.github.io",
    "http://localhost/cybrok3.github.io",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // 1. Get fresh access token from your own refresh-token API
    const tokenRes = await fetch('https://nerdspace-indol.vercel.app/api/refresh-token');
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    // 2. Fetch tracks from your playlist using the refreshed access token
    const playlistId = process.env.SPOTIFY_VIVES_PLAYLIST_ID;

    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return res.status(500).json({ error: 'No tracks found in playlist.' });
    }

    // 3. Pick a random track
    const tracks = playlistData.items;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const randomTrack = tracks[randomIndex]?.track;

    if (!randomTrack) {
      return res.status(500).json({ error: 'No track found at random index.' });
    }

    // 4. Return the track info
    res.status(200).json({
      name: randomTrack.name,
      artists: randomTrack.artists.map(a => a.name),
      url: randomTrack.external_urls.spotify,
      preview_url: randomTrack.preview_url,
      album_cover: randomTrack.album.images[0]?.url || null,
    });

  } catch (err) {
    console.error('Error fetching random track:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}