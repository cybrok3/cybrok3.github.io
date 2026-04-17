document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-link");
    const mainContent = document.getElementById("main-content");
    const clickSound = document.getElementById("navClickSound");

    function loadPage(page) {
        const url = `${page}.html`;
        fetch(url)
            .then(response => response.text())
            .then(data => {
                // Wrap content for animation
                mainContent.innerHTML = `<div class="content-slide">${data}</div>`;

                const newContent = mainContent.querySelector(".content-slide");

                if (newContent) {
                    // Force reflow to register initial state
                    void newContent.offsetWidth; // reading offsetWidth forces reflow

                    // Then add class to trigger animation
                    newContent.classList.add("active");
                }

                // If it's the ozz page, initialize its script
                if (page === "ozz") {
                    initOzzPage();
                }

                if(page === "art"){
                    initMyArtPage();
                }

                if(page ==="sk8"){
                    initSkateClipsPage();
                }

                if(page === "music"){
                    initMusicPage();
                }

                if(page === "home"){
                    initNasaCard();
                }
            })
            .catch(err => {
                mainContent.innerHTML = "<p>Failed to load content.</p>";
                console.error(err);
            });
    }

    function highlightActiveLink(page) {
        links.forEach(link => link.classList.remove("active"));
        links.forEach(link => {
            if (link.getAttribute("href") === `#${page}`) {
                link.classList.add("active");
            }
        });
    }

    function handleRoute() {
        const page = window.location.hash.replace("#", "") || "home";
        loadPage(page);
        highlightActiveLink(page);
    }

    // Handle link clicks (optional — hashchange also covers it)
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            if (clickSound) {
                clickSound.currentTime = 0; // rewind to start
                clickSound.play().catch(err => console.warn("Sound blocked:", err));
            }

            const page = link.getAttribute("href").replace("#", "");
            window.location.hash = page; // triggers handleRoute()
        });
    });

    // Handle back/forward navigation
    window.addEventListener("hashchange", handleRoute);

    // Initial load
    handleRoute();

    // Hearts logic for the ozz page
    function initOzzPage() {
        const container = document.getElementById("cat-container");
        const heartsContainer = document.getElementById("hearts-container");

        if (!container || !heartsContainer) return;

        container.addEventListener("click", (e) => {
            const rect = container.getBoundingClientRect();

            const heart = document.createElement("div");
            heart.classList.add("heart");

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;

            heartsContainer.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
        });
    }

    function initMyArtPage() {
        const grid = document.getElementById("art-grid");
        if (!grid) return;

        fetch("https://cybrok3.github.io/posts/my_art/my-art.json")
            .then(res => res.json())
            .then(posts => {
                posts.forEach(post => {
                    const card = document.createElement("div");
                    card.className = "card media-card art-card";

                    card.innerHTML = `
                        <img src="${post.imageUrl}" alt="${post.title}">
                        <div class="media-card-title">${post.title}</div>
                        <p class="media-card-description">${post.description}</p>
                        ${post.link ? `
                        <div class="spotify-container">
                            <iframe 
                                src="${getSpotifyEmbedUrl(post.link)}" 
                                frameborder="0" 
                                allowtransparency="true" 
                                allow="encrypted-media">
                            </iframe>
                        </div>
                        ` : ""}
                        `;
                    grid.appendChild(card);
                });
            })
            .catch(err => console.error("Failed to load art posts:", err));
    }

    function initSkateClipsPage() {
        const grid = document.getElementById("skate-grid");
        if (!grid) return;

        fetch("https://cybrok3.github.io/posts/skate_clips/skate-clips.json")
            .then(res => res.json())
            .then(posts => {
                posts.forEach(post => {
                    const card = document.createElement("div");
                    card.className = "card media-card skate-card";

                    card.innerHTML = `
                        <video controls>
                            <source src="${post.videoUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div class="media-card-title">${post.title}</div>
                        <p class="media-card-description">${post.description}</p>
                    `;

                    grid.appendChild(card);
                });
            })
            .catch(err => console.error("Failed to load skate clips:", err));
    }

    function initMusicPage() {
        const grid = document.getElementById("music-grid");
        if (!grid) return;
        
        const playIcon = `
            <svg width="20" height="22" viewBox="4 4 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 12.3301L9 16.6603L9 8L15 12.3301Z"></path>
            </svg>
        `;

        const pauseIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="22" preserveAspectRatio="xMidYMid meet">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"></path>
            </svg>
        `;

        function formatTime(seconds) {
            const safeSeconds = Math.floor(Number.isFinite(seconds) ? seconds : 0);
            const minutes = Math.floor(safeSeconds / 60);
            const remainder = safeSeconds % 60;
            return `${minutes}:${remainder.toString().padStart(2, "0")}`;
        }

        function updateSliderFill(slider) {
            if (!slider) return;
            const value = parseFloat(slider.value || "0");
            const min = parseFloat(slider.min || "0");
            const max = parseFloat(slider.max || "100");
            const percent = ((value - min) / (max - min)) * 100;
            slider.style.setProperty("--percent", `${percent}%`);
        }

        function initAudioCard(card) {
            const audio = card.querySelector(".music-audio-element");
            const playBtn = card.querySelector(".music-audio-play");
            const progress = card.querySelector(".music-audio-progress");
            const currentTimeEl = card.querySelector(".music-audio-current");
            const durationEl = card.querySelector(".music-audio-duration");
            const volume = card.querySelector(".music-audio-volume");

            if (!audio || !playBtn || !progress || !currentTimeEl || !durationEl || !volume) return;

            function updatePlayButton() {
                playBtn.innerHTML = audio.paused ? playIcon : pauseIcon;
            }

            function updateProgressUI() {
                const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
                const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;

                currentTimeEl.textContent = formatTime(current);
                durationEl.textContent = formatTime(duration);

                if (duration > 0) {
                    progress.value = ((current / duration) * 100).toString();
                } else {
                    progress.value = "0";
                }

                updateSliderFill(progress);
            }

            audio.volume = parseFloat(volume.value || "0.8");
            updatePlayButton();
            updateProgressUI();
            updateSliderFill(volume);

            playBtn.addEventListener("click", () => {
                if (audio.paused) {
                    grid.querySelectorAll(".music-audio-element").forEach(other => {
                        if (other !== audio) {
                            other.pause();
                        }
                    });
                    audio.play().catch(err => console.warn("Audio playback blocked:", err));
                } else {
                    audio.pause();
                }
            });

            progress.addEventListener("input", () => {
                const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
                const value = parseFloat(progress.value || "0");
                if (duration > 0) {
                    audio.currentTime = (value / 100) * duration;
                }
                updateSliderFill(progress);
            });

            volume.addEventListener("input", () => {
                audio.volume = parseFloat(volume.value || "0.8");
                updateSliderFill(volume);
            });

            audio.addEventListener("loadedmetadata", updateProgressUI);
            audio.addEventListener("timeupdate", updateProgressUI);
            audio.addEventListener("play", updatePlayButton);
            audio.addEventListener("pause", updatePlayButton);
            audio.addEventListener("ended", () => {
                audio.currentTime = 0;
                updateProgressUI();
                updatePlayButton();
            });
        }

        fetch(`posts/my_music/my-music.json?v=${Date.now()}`)
            .then(res => res.json())
            .then(posts => {
                posts.forEach(post => {
                    const card = document.createElement("div");
                    card.className = "card media-card music-card";

                    const mediaMarkup = post.audioUrl
                        ? `
                            <div class="music-audio-player">
                                <audio class="music-audio-element" preload="metadata">
                                    <source src="${post.audioUrl}" type="audio/mpeg">
                                    Your browser does not support the audio tag.
                                </audio>
                                <div class="music-audio-top">
                                    <button type="button" class="music-audio-play" aria-label="Play audio sample">${playIcon}</button>
                                    <div class="music-audio-track">
                                        <div class="music-audio-track-title">${post.title}</div>
                                        <div class="music-audio-track-meta">Yet another random idea for a song</div>
                                    </div>
                                </div>
                                <div class="music-audio-bottom">
                                    <span class="music-audio-current">0:00</span>
                                    <input class="music-audio-progress music-audio-slider" type="range" min="0" max="100" step="1" value="0" aria-label="Track progress">
                                    <span class="music-audio-duration">0:00</span>
                                    <svg class="music-audio-volume-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.46 3c-1 0-1 .13-6.76 4H1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3.7l5.36 3.57A2.54 2.54 0 0 0 14 18.46V5.54A2.54 2.54 0 0 0 11.46 3zM2 9h2v6H2zm10 9.46a.55.55 0 0 1-.83.45L6 15.46V8.54l5.17-3.45a.55.55 0 0 1 .83.45zM16.83 9.17a1 1 0 0 0-1.42 1.42 2 2 0 0 1 0 2.82 1 1 0 0 0 .71 1.71c1.38 0 3.04-3.62.71-5.95z"></path></svg>
                                    <input class="music-audio-volume music-audio-slider" type="range" min="0" max="1" step="0.01" value="0.8" aria-label="Track volume">
                                </div>
                            </div>
                        `
                        : `
                            <video controls>
                                <source src="${post.videoUrl}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        `;

                    card.innerHTML = `
                        ${mediaMarkup}
                        <div class="media-card-title">${post.title}</div>
                        <p class="media-card-description">${post.description}</p>
                    `;

                    grid.appendChild(card);

                    if (post.audioUrl) {
                        initAudioCard(card);
                    }
                });
            })
            .catch(err => console.error("Failed to load music clips:", err));
    }

    function getSpotifyEmbedUrl(trackUrl) {
        // Example track URL:
        // https://open.spotify.com/track/4CeeEOM32jQcH3eN9Q2dGj
        // Convert to embed format:
        // https://open.spotify.com/embed/track/4CeeEOM32jQcH3eN9Q2dGj
        return trackUrl.replace("open.spotify.com/track/", "open.spotify.com/embed/track/");
    }
});
