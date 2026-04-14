function initNasaCard() {
    const img = document.getElementById("nasaPhoto");
    const video = document.getElementById("nasaVideo");
    const title = document.getElementById("nasaTitle");
    const date = document.getElementById("nasaDate");
    const hdLink = document.getElementById("nasaHDLink");
    const articleLink = document.getElementById("nasaArticleLink");
    const loader = document.getElementById("nasaLoader");
    const fallbackImage = "resources/logos/nasa-logo.png";

    if (!img || !title) return;

    const API_KEY = "lodDRUAacIHblIgnGBfbB8BFtz1B6pwmddEWeKTv";

    function showLoader() {
        if (loader) loader.style.display = "block";
        img.style.display = "none";
        video.style.display = "none";
        title.style.display = "none";
        date.style.display = "none";
        hdLink.style.display = "none";
        articleLink.style.display = "none";
    }

    function showCardDetails(showHdLink = false, showArticle = false) {
        if (loader) loader.style.display = "none";
        title.style.display = "block";
        date.style.display = "block";
        hdLink.style.display = showHdLink ? "block" : "none";
        articleLink.style.display = showArticle ? "block" : "none";
    }

    function showFallbackImage() {
        video.style.display = "none";
        video.src = "";

        img.onerror = null;
        img.onload = () => {
            showCardDetails(false, false);
            img.style.display = "block";
        };
        img.src = fallbackImage;

        title.textContent = "NASA Picture could not be fetched today :(";
        date.textContent = "";
    }

    showLoader();

    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`NASA API request failed with status ${res.status}`);
            }

            return res.json();
        })
        .then(data => {
            if (!data || !data.media_type || !data.date) {
                throw new Error("NASA API returned incomplete data");
            }

            title.textContent = data.title;
            date.textContent = `Date: ${data.date}`;

            if (data.media_type === "image") {
                // Show image, hide video
                video.style.display = "none";
                video.src = "";

                img.onerror = showFallbackImage;
                img.onload = () => {
                    showCardDetails(Boolean(data.hdurl), true);
                    img.style.display = "block";
                };
                img.src = data.url;

            } else if (data.media_type === "video") {

                // Show video, hide image
                img.style.display = "none";
                img.onerror = null;
                img.onload = null;
                img.src = "";

                video.onload = () => {
                    showCardDetails(false, true);
                    video.style.display = "block";
                };
                video.onerror = showFallbackImage;
                video.src = data.url;  // APOD video URLs work directly in iframe
            } else {
                throw new Error(`Unsupported NASA media type: ${data.media_type}`);
            }

            // HD link
            if (data.hdurl) {
                hdLink.href = data.hdurl;
            } else {
                hdLink.style.display = "none";
            }

            // ARTICLE URL
            const parts = data.date.split("-");
            const yy = parts[0].substring(2);
            const mm = parts[1];
            const dd = parts[2];

            articleLink.href = `https://apod.nasa.gov/apod/ap${yy}${mm}${dd}.html`;
        })
        .catch(err => {
            console.error("NASA API error:", err);
            showFallbackImage();
        });
}
