document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-link");
    const mainContent = document.getElementById("main-content");
    const clickSound = document.getElementById("navClickSound");

    function loadPage(page) {
        const url = `${page}.html`; // e.g. "projects.html"
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
});