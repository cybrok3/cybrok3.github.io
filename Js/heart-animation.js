document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cat-container");
  const heartsContainer = document.getElementById("hearts-container");

  container.addEventListener("click", (e) => {
    // Get container position
    const rect = container.getBoundingClientRect();

    // Create heart element
    const heart = document.createElement("div");
    heart.classList.add("heart");

    // Set heart position relative to container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    // Add and remove heart
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  });
});