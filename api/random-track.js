/**
 * API handler for picking a random song out of one of my spotify playlists.
 * 
 * Makes a request for a new access_token, to the refresh-token API handler, and gets the access token
 * as a response if everything goes right.
 * 
 * Then it makes another request to a spotify api endpoint to obtain the tracks of the specific
 * playlist I've chosen.
 * 
 * Finally it generates a random index, picks a track out of the tracks of that playlist based on that index
 * and send track json back to the caller. (music-player.js)
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 * @returns  @returns {Promise<void>}
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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const accessToken = authHeader.replace("Bearer ", "");

  try {

    // Fetch tracks from your playlist using the refreshed access token
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

    // Pick a random track
    const tracks = playlistData.items;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const randomTrack = tracks[randomIndex]?.track;

    if (!randomTrack) {
      return res.status(500).json({ error: 'No track found at random index.' });
    }

    // Return the track info
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