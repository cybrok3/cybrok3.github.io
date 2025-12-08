function initNasaCard() {
    const img = document.getElementById("nasaPhoto");
    const video = document.getElementById("nasaVideo");
    const title = document.getElementById("nasaTitle");
    const date = document.getElementById("nasaDate");
    const hdLink = document.getElementById("nasaHDLink");
    const articleLink = document.getElementById("nasaArticleLink");

    if (!img || !title) return;

    const API_KEY = "lodDRUAacIHblIgnGBfbB8BFtz1B6pwmddEWeKTv";

    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {

            title.textContent = data.title;
            date.textContent = `Date: ${data.date}`;

            if (data.media_type === "image") {
                // Show image, hide video
                img.style.display = "block";
                video.style.display = "none";

                img.src = data.url;

            } else if (data.media_type === "video") {

                // Show video, hide image
                img.style.display = "none";
                video.style.display = "block";

                video.src = data.url;  // APOD video URLs work directly in iframe
            }

            // HD link
            if (data.hdurl) {
                hdLink.href = data.hdurl;
                hdLink.style.display = "block";
            } else {
                hdLink.style.display = "none";
            }

            // ARTICLE URL
            const parts = data.date.split("-");
            const yy = parts[0].substring(2);
            const mm = parts[1];
            const dd = parts[2];

            articleLink.href = `https://apod.nasa.gov/apod/ap${yy}${mm}${dd}.html`;
            articleLink.style.display = "block";
        })
        .catch(err => console.error("NASA API error:", err));
}