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

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const playlistId = process.env.SPOTIFY_VIVES_PLAYLIST_ID;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // 1. Get access token from Spotify
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch tracks from your playlist
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const playlistData = await playlistResponse.json();

    // 3. Pick a random track
    const tracks = playlistData.items;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const randomTrack = tracks[randomIndex]?.track;

    if (!randomTrack) {
      return res.status(500).json({ error: 'No tracks found in playlist.' });
    }

    res.status(200).json({
      name: randomTrack.name,
      artist: randomTrack.artists.map(a => a.name).join(', '),
      url: randomTrack.external_urls.spotify,
      preview_url: randomTrack.preview_url,
      album_cover: randomTrack.album.images[0].url,
    });

  } catch (err) {
    console.error('Error fetching random track:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}