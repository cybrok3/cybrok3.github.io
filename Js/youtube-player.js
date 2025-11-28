// Js/youtube-player.js

// ====== CONFIG ======
const PLAYLIST_ID = "PLenEnUvk42UUy63Xz4sDRb-qOPLlmXT2z"; // my chosen playlist

// ====== STATE ======
let ytPlayer = null;
let isPlaying = false;
let duration = 0;
let progressTimer = null;
let firstInteractionDone = false;

// ====== DOM ELEMENTS ======
const playPauseBtn   = document.getElementById("playPauseBtn");
const trackCoverEl   = document.getElementById("trackCover");
const trackNameEl    = document.getElementById("trackName");
const artistNameEl   = document.getElementById("artistName");
const progressBar    = document.getElementById("progressBar");
const currentTimeEl  = document.getElementById("currentTime");
const durationEl     = document.getElementById("duration");
const volumeSlider   = document.getElementById("volumeSlider");

// SVG icons
const playIcon = `
<svg style="justify-content: center; align-items: center;" width="25px" height="30px" viewBox="4 4 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
  <g id="SVGRepo_iconCarrier">
    <path d="M15 12.3301L9 16.6603L9 8L15 12.3301Z"></path>
  </g>
</svg>
`;

const pauseIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25px" height="30px" preserveAspectRatio="xMidYMid meet">
  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
</svg>
`;

// ====== HELPERS ======
function formatTime(seconds) {
  seconds = Math.floor(seconds || 0);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function updateSliderFill(slider) {
  if (!slider) return;
  const value = slider.value;
  const min = slider.min || 0;
  const max = slider.max || 100;
  const percent = ((value - min) / (max - min)) * 100;
  slider.style.setProperty("--percent", `${percent}%`);
}

function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(() => {
    if (!ytPlayer || !duration) return;

    const current = ytPlayer.getCurrentTime();
    currentTimeEl.textContent = formatTime(current);

    const pct = Math.max(0, Math.min(100, (current / duration) * 100));
    progressBar.value = pct;
    updateSliderFill(progressBar);
  }, 1000);
}

function stopProgressTimer() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function updateTrackInfo() {
  if (!ytPlayer) return;

  const data = ytPlayer.getVideoData(); // { video_id, title, author, ... }
  const fullTitle = data.title || "";
  let artist = "";
  let title  = fullTitle;

  // Try to split on " - " to get "Artist - Track"
  const dashIdx = fullTitle.indexOf(" - ");
  if (dashIdx > 0) {
    artist = fullTitle.substring(0, dashIdx).trim();
    title  = fullTitle.substring(dashIdx + 3).trim();
  } else {
    // Fallback: use channel as artist
    artist = data.author || "";
  }

  trackNameEl.textContent  = title  || fullTitle || "Unknown track";
  artistNameEl.textContent = artist || data.author || "Unknown artist";

  // Thumbnail as cover
  const videoId = data.video_id;
  if (videoId) {
    trackCoverEl.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Duration in seconds
  duration = ytPlayer.getDuration() || 0;
  durationEl.textContent = formatTime(duration);
}

// ====== YOUTUBE IFRAME API ENTRY POINT ======
// This must be global because YouTube calls it
window.onYouTubeIframeAPIReady = function () {
  // Create a hidden container for the YouTube player
  const container = document.createElement("div");
  container.id = "yt-hidden-player";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "0";
  container.style.height = "0";
  document.body.appendChild(container);

  ytPlayer = new YT.Player("yt-hidden-player", {
    height: "0",
    width: "0",
    playerVars: {
      listType: "playlist",
      list: PLAYLIST_ID,
      autoplay: 0,    // we'll start it manually after user interaction
      controls: 0,
      iv_load_policy: 3
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerReady(event) {
  // Set initial volume from your slider (0–1 -> 0–100)
  if (volumeSlider) {
    const vol = parseFloat(volumeSlider.value || "0.8");
    event.target.setVolume(vol * 100);
    updateSliderFill(volumeSlider);
  }

  // UI initial state
  if (playPauseBtn) {
    playPauseBtn.innerHTML = playIcon;
  }
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  updateSliderFill(progressBar);

  // Start playback on first ANY interaction (click, key, touch)
  ["click", "keydown", "touchstart"].forEach(evt => {
    document.addEventListener(
      evt,
      () => {
        if (firstInteractionDone || !ytPlayer) return;
        firstInteractionDone = true;
        ytPlayer.playVideo();
      },
      { once: true }
    );
  });
}

function onPlayerStateChange(event) {
  if (!ytPlayer) return;

  const state = event.data;

  if (state === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (playPauseBtn) playPauseBtn.innerHTML = pauseIcon;

    updateTrackInfo();
    startProgressTimer();
  } else if (state === YT.PlayerState.PAUSED) {
    isPlaying = false;
    if (playPauseBtn) playPauseBtn.innerHTML = playIcon;

    stopProgressTimer();
  } else if (state === YT.PlayerState.ENDED) {
    // Move to next video in the playlist
    ytPlayer.nextVideo();
  }
}

// ====== UI EVENT HANDLERS ======
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (!ytPlayer) return;

    // If the first interaction is via this button, mark it
    if (!firstInteractionDone) {
      firstInteractionDone = true;
    }

    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });
}

if (volumeSlider) {
  volumeSlider.addEventListener("input", (e) => {
    if (!ytPlayer) return;
    const vol = parseFloat(e.target.value || "0.8");
    ytPlayer.setVolume(vol * 100);
    updateSliderFill(e.target);
  });

  // Initial visual fill
  updateSliderFill(volumeSlider);
}

if (progressBar) {
  // Seeking
  progressBar.addEventListener("input", (e) => {
    if (!ytPlayer || !duration) return;
    const pct = parseFloat(e.target.value || "0");
    const newTime = (pct / 100) * duration;
    ytPlayer.seekTo(newTime, true);
    updateSliderFill(e.target);
  });

  // Initial fill
  updateSliderFill(progressBar);
}