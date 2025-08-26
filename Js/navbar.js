// navbar.js

document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-link");

    function highlightActive(url) {
        links.forEach(link => link.classList.remove("active"));
        links.forEach(link => {
            if (link.getAttribute("href") === url) {
                link.classList.add("active");
            }
        });
    }

    // Highlight the link for the initial page
    highlightActive(window.location.pathname.split("/").pop() || "index.html");

    // Listen for SPA page loads
    window.addEventListener("pageChanged", (e) => {
        highlightActive(e.detail.url);
    });
});
