document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-link");
    const mainContent = document.getElementById("main-content");

    function loadPage(page) {
        const url = `${page}.html`; // e.g. "projects.html"
        fetch(url)
            .then(response => response.text())
            .then(data => {
                mainContent.innerHTML = data;
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
            const page = link.getAttribute("href").replace("#", "");
            window.location.hash = page; // triggers handleRoute()
        });
    });

    // Handle back/forward navigation
    window.addEventListener("hashchange", handleRoute);

    // Initial load
    handleRoute();
});
