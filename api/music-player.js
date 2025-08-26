/**
 * Creates a player, connects it with spotify api, and is responsible for the functionality of the music player
 */

let player;
let isPaused = true;
let currentTrackDuration = 0;
let deviceId = null;

function formatMs(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// This class returns a browser player which is authenticated via the refresh-token API handler in vercel.
window.onSpotifyWebPlaybackSDKReady = async() => {

  // Get the access token ONCE
  const tokenResponse = await fetch('https://nerdspace-indol.vercel.app/api/refresh-token');
  const tokenData = await tokenResponse.json();
  accessToken = tokenData.access_token;

  player = new Spotify.Player({
    name: 'My Web Player',
    getOAuthToken: cb => cb(accessToken),
    volume: 0.5
  });

  // Once player is connected, it gets a device_id assigned
  player.addListener('ready', async ({ device_id }) => {
    console.log('Ready with Device ID');
    deviceId = device_id;

    // Call your /api/play endpoint with the device_id to start random track playback
    try {
      const playResponse = await fetch(`https://nerdspace-indol.vercel.app/api/play?device_id=${deviceId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

       const result = await playResponse.json();
      
      if (!playResponse.ok) {
        console.error('Playback error:', error);
      } else {
        console.log('Playback started:', result.message);
      }
    } catch (error) {
      console.error('Error calling play API:', error);
    }
  });

  player.addListener('player_state_changed', state => {
  if (!state) return;

  isPaused = state.paused;
  currentTrackDuration = state.duration;

  const currentTrack = state.track_window.current_track;

  // Cover image
  const coverEl = document.getElementById('trackCover');
  if (currentTrack.album.images.length > 0) {
    coverEl.src = currentTrack.album.images[0].url; // largest image
  } else {
    coverEl.src = "resources/default-cover.jpg"; // fallback
  }

  // Track + artist names
  document.getElementById('trackName').textContent = currentTrack.name;
  document.getElementById('artistName').textContent = currentTrack.artists.map(a => a.name).join(', ');

  // Play/pause button
  document.getElementById('playPauseBtn').textContent = isPaused ? '▶️' : '⏸️';

  // Duration
  document.getElementById('duration').textContent = formatMs(state.duration);
});


  player.connect();
};

// Toggle play/pause
document.getElementById('playPauseBtn').addEventListener('click', () => {
  if (!player) return;

  if (isPaused) {
    player.resume();
  } else {
    player.pause();
  }
});

// Volume control
document.getElementById('volumeSlider').addEventListener('input', (e) => {
  if (!player) return;

  player.setVolume(parseFloat(e.target.value));
});

// Progress bar (read-only for now)
setInterval(async () => {
  if (!player) return;

  const state = await player.getCurrentState();
  if (!state) return;

  const position = state.position;
  document.getElementById('progressBar').value = (position / currentTrackDuration) * 100;
  document.getElementById('currentTime').textContent = formatMs(position);
}, 1000);