let player;
let isPaused = true;
let currentTrackDuration = 0;

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

  // Error handling
  player.addListener('initialization_error', ({ message }) => console.error('Initialization Error:', message));
  player.addListener('authentication_error', ({ message }) => console.error('Authentication Error:', message));
  player.addListener('account_error', ({ message }) => console.error('Account Error:', message));
  player.addListener('playback_error', ({ message }) => console.error('Playback Error:', message));

  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    fetch(`https://nerdspace-indol.vercel.app/api/play?device_id=${device_id}`);
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

document.addEventListener('DOMContentLoaded', () => {
  // Toggle play/pause
  document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (isPaused) {
      player.resume();
    } else {
      player.pause();
    }
  });

  // Volume control
  document.getElementById('volumeSlider').addEventListener('input', (e) => {
    player.setVolume(parseFloat(e.target.value));
  });

  // Progress bar update
  setInterval(async () => {
    if (!player) return;

    const state = await player.getCurrentState();
    if (!state) return;

    const position = state.position;
    document.getElementById('progressBar').value = (position / currentTrackDuration) * 100;
    document.getElementById('currentTime').textContent = formatMs(position);
  }, 1000);
});