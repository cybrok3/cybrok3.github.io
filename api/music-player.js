document.addEventListener("DOMContentLoaded", () => {
    async function playRandomTrack() {
        try {
            const response = await fetch('https://nerdspace-indol.vercel.app/api/random-track');
            if (!response.ok) throw new Error('Failed to fetch track');

            const track = await response.json();
            const audioUrl = track.preview_url || track.stream_url;

            if (!audioUrl) {
            console.error('No playable URL found in track');
            return;
            }

            const audio = document.getElementById('audio-player');
            audio.src = audioUrl;

            // Wait for audio metadata to load before playing
            audio.onloadedmetadata = () => {
            audio.play().catch(err => {
                console.warn('Auto-play was prevented:', err);
            });
            };

        } catch (error) {
            console.error('Error playing track:', error);
        }
    }

    // Play as soon as the page loads
    window.addEventListener('load', () => {
    playRandomTrack();
    });
});