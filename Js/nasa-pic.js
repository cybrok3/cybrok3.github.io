function initNasaCard() {
    const img = document.getElementById("nasaPhoto");
    const title = document.getElementById("nasaTitle");
    const date = document.getElementById("nasaDate");
    const hdLink = document.getElementById("nasaHDLink");
    const articleLink = document.getElementById("nasaArticleLink");

    if (!img || !title) return;

    const API_KEY = "lodDRUAacIHblIgnGBfbB8BFtz1B6pwmddEWeKTv";

    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            // Title
            title.textContent = data.title;

            // Date
            date.textContent = `Date: ${data.date}`;

            // Image
            if (data.media_type === "image") {
                img.src = data.url;
            } else {
                img.src = "resources/logos/nerdspace_icon.png";
            }

            img.style.display = "block";

            // HD link
            if (data.hdurl) {
                hdLink.href = data.hdurl;
                hdLink.style.display = "block";
            } else {
                hdLink.style.display = "none";
            }

            // ARTICLE LINK
            // Convert YYYY-MM-DD to YYMMDD
            const parts = data.date.split("-");
            const yy = parts[0].substring(2);
            const mm = parts[1];
            const dd = parts[2];

            const articleUrl = `https://apod.nasa.gov/apod/ap${yy}${mm}${dd}.html`;

            articleLink.href = articleUrl;
            articleLink.style.display = "block";

        })
        .catch(err => console.error("NASA API error:", err));
}