let player;
let isPaused = true;
let currentTrackDuration = 0;
let deviceId = null;

function formatMs(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

window.onSpotifyWebPlaybackSDKReady = () => {
  player = new Spotify.Player({
    name: 'My Web Player',
    getOAuthToken: cb => {
      fetch('https://nerdspace-indol.vercel.app/api/refresh-token')
        .then(res => res.json())
        .then(data => cb(data.access_token));
    },
    volume: 0.8
  });

  player.addListener('ready', async ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    deviceId = device_id;

    // Call your /api/play endpoint with the device_id to start random track playback
    try {
      const playResponse = await fetch(`https://nerdspace-indol.vercel.app/api/play?device_id=${deviceId}`);
      if (!playResponse.ok) {
        const error = await playResponse.json();
        console.error('Playback error:', error);
      } else {
        const result = await playResponse.json();
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

    document.getElementById('trackInfo').textContent =
      `${currentTrack.name} — ${currentTrack.artists.map(a => a.name).join(', ')}`;

    document.getElementById('playPauseBtn').textContent = isPaused ? '▶️' : '⏸️';
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

// 🔊 Volume control
document.getElementById('volumeSlider').addEventListener('input', (e) => {
  if (!player) return;

  player.setVolume(parseFloat(e.target.value));
});

// ⏱️ Progress bar (read-only for now)
setInterval(async () => {
  if (!player) return;

  const state = await player.getCurrentState();
  if (!state) return;

  const position = state.position;
  document.getElementById('progressBar').value = (position / currentTrackDuration) * 100;
  document.getElementById('currentTime').textContent = formatMs(position);
}, 1000);