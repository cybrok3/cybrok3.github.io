window.onSpotifyWebPlaybackSDKReady = async () => {
  // Fetch access token from your backend
  const res = await fetch('https://your-vercel-project.vercel.app/api/refresh-token');
  const { access_token } = await res.json();

  const player = new Spotify.Player({
    name: 'Web Playback SDK Player',
    getOAuthToken: cb => cb(access_token),
    volume: 0.5
  });

  // Connect to the player
  player.connect();

  // Listen for ready event
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    playRandomTrack(device_id, access_token);
  });

  // Error handling (optional)
  player.addListener('initialization_error', ({ message }) => console.error(message));
  player.addListener('authentication_error', ({ message }) => console.error(message));
  player.addListener('account_error', ({ message }) => console.error(message));
  player.addListener('playback_error', ({ message }) => console.error(message));
};

// Function to play a track using Spotify API
async function playRandomTrack(deviceId, token) {
  // Get a random track from your backend
  const res = await fetch('https://your-vercel-project.vercel.app/api/random-track');
  const data = await res.json();

  if (!data || !data.url) {
    console.error('No track returned from backend');
    return;
  }

  // Extract track ID from URL
  const trackId = data.url.split('/').pop();

  // Send play command to Spotify
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: [`spotify:track:${trackId}`],
    }),
  });

  console.log(`Playing: ${data.name} by ${data.artists.join(', ')}`);
}