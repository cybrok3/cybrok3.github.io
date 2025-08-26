document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-link");
    const mainContent = document.getElementById("main-content");

    function loadPage(url) {
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

    function highlightActiveLink(url) {
        links.forEach(link => link.classList.remove("active"));
        links.forEach(link => {
            if (link.getAttribute("href") === url) {
                link.classList.add("active");
            }
        });
    }

    // Handle link clicks
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            loadPage(url);
            history.pushState({ page: url }, null, url);
            highlightActiveLink(url);
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
        const url = e.state?.page || "home.html";
        loadPage(url);
        highlightActiveLink(url);
    });

    // -------------------------
    // INITIAL LOAD
    // -------------------------
    const currentPath = window.location.pathname.split("/").pop();

    // Decide which page to load initially
    const initialPage = currentPath === "" || currentPath === "index.html" ? "home.html" : currentPath;

    // Load it and highlight
    loadPage(initialPage);
    highlightActiveLink(initialPage);

    // Replace state so SPA back button works correctly
    history.replaceState({ page: initialPage }, null, initialPage);
});