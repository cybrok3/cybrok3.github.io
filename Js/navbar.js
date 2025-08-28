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

    // --- SIDEBAR TOGGLE (NO OVERLAY) ---
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // **Use the same 'links' variable**
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                // optional: show the toggle again if you add the hidden class logic
                if(toggleBtn) toggleBtn.classList.remove('hidden');
            }
        });
    });
});