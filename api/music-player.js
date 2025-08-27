/**
 * Creates a player, connects it with Spotify API, and is responsible for the functionality of the music player.
 * Now supports automatic playback of the next random track when the current one ends.
 */

let player;
let isPaused = true;
let currentTrackDuration = 0;
let deviceId = null;
let accessToken = null;
let trackEnded = false;

function formatMs(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Function to play the next random track
async function playNextTrack() {
  try {
    // Refresh access token
    const tokenResponse = await fetch('https://nerdspace-indol.vercel.app/api/refresh-token');
    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;

    // Fetch a new random track
    const trackResponse = await fetch('https://nerdspace-indol.vercel.app/api/random-track', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const track = await trackResponse.json();

    // Play on the same device
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: [track.uri] })
    });

    // Update UI
    document.getElementById('trackName').textContent = track.name;
    document.getElementById('artistName').textContent = track.artists.join(', ');
    document.getElementById('trackCover').src = track.album_cover || 'resources/default-cover.jpg';

  } catch (err) {
    console.error('Error playing next track:', err);
  }
}

// Initialize Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = async () => {
  // Get access token once
  const tokenResponse = await fetch('https://nerdspace-indol.vercel.app/api/refresh-token');
  const tokenData = await tokenResponse.json();
  accessToken = tokenData.access_token;

  const playIcon = `<svg style="justify-content: center; align-items: center;" width="25px" height="30px" viewBox="4 4 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 12.3301L9 16.6603L9 8L15 12.3301Z"></path> </g></svg>`;
  const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25px" height="30px" preserveAspectRatio="xMidYMid meet"> <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/> </svg>`;

  player = new Spotify.Player({
    name: 'My Web Player',
    getOAuthToken: cb => cb(accessToken),
    volume: 0.5
  });

  // Player ready
  player.addListener('ready', async ({ device_id }) => {
    console.log('Ready with Device ID:', device_id);
    deviceId = device_id;
  });

  // Player state change listener
  player.addListener('player_state_changed', state => {
    if (!state) return;

    isPaused = state.paused;
    currentTrackDuration = state.duration;

    const currentTrack = state.track_window.current_track;

    // Update UI
    document.getElementById('trackName').textContent = currentTrack.name;
    document.getElementById('artistName').textContent = currentTrack.artists.map(a => a.name).join(', ');
    document.getElementById('trackCover').src = currentTrack.album.images[0]?.url || 'resources/default-cover.jpg';
    document.getElementById('playPauseBtn').innerHTML = isPaused ? playIcon : pauseIcon;
    document.getElementById('duration').textContent = formatMs(state.duration);

    // Auto-play next track when current ends (once per track)
    if (state.paused && state.position === 0) {
      if (!trackEnded) {
        trackEnded = true;
        playNextTrack().finally(() => {
          trackEnded = false; // reset for the next track
        });
      }
    } else {
      trackEnded = false; // reset if track is playing
    }

  });

  // Connect player
  player.connect();
};

let firstInteraction = false;

function startPlaybackAfterInteraction() {
    if (firstInteraction) return;
    firstInteraction = true;

    // Only now start the first track
    playNextTrack();
}

// Listen for any gesture
['click', 'keydown', 'touchstart'].forEach(evt => {
    document.body.addEventListener(evt, startPlaybackAfterInteraction, { once: true });
});

// Play/pause toggle
document.getElementById('playPauseBtn').addEventListener('click', () => {
  if (!player) return;
  if (isPaused) player.resume();
  else player.pause();
});

// Volume control
document.getElementById('volumeSlider').addEventListener('input', e => {
  if (!player) return;
  player.setVolume(parseFloat(e.target.value));
});

function updateSliderFill(slider) {
  const value = slider.value;
  const min = slider.min || 0;
  const max = slider.max || 100;
  const percent = ((value - min) / (max - min)) * 100;
  slider.style.setProperty('--percent', `${percent}%`);
}

// Initial fill
updateSliderFill(document.getElementById('volumeSlider'));
updateSliderFill(document.getElementById('progressBar'));

// Update fill on user input
document.getElementById('volumeSlider').addEventListener('input', e => updateSliderFill(e.target));
document.getElementById('progressBar').addEventListener('input', e => updateSliderFill(e.target));


// Progress bar update
setInterval(async () => {
  if (!player) return;
  const state = await player.getCurrentState();
  if (!state) return;
  const position = state.position;
  document.getElementById('progressBar').value = (position / currentTrackDuration) * 100;
  document.getElementById('currentTime').textContent = formatMs(position);
  updateSliderFill(document.getElementById('progressBar'));
}, 1000);
