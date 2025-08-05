// navbar.js

// Highlight active nav-link based on current page
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-link").forEach(link => {
        const href = link.getAttribute("href");
        if (href === "index.html") return;
        if (href === currentPage) {
            link.classList.add("active");
        }
    });
});