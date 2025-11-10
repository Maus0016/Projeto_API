// Wait for the page to fully load before showing it
window.addEventListener("load", () => {
  document.body.classList.add("loaded");

  // Animate images sliding in from alternating sides
  const images = document.querySelectorAll("img");
  images.forEach((img, i) => {
    const fromLeft = i % 2 === 0;
    img.style.opacity = "0";
    img.style.transform = fromLeft
      ? "translateX(-50px)"
      : "translateX(50px)";

    setTimeout(() => {
      img.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      img.style.opacity = "1";
      img.style.transform = "translateX(0)";
    }, 200 + i * 150);
  });
});

// Smooth fade/slide transition between pages
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");

    if (href && !href.startsWith("http") && !href.startsWith("#")) {
      e.preventDefault();

      document.body.classList.remove("loaded");
      document.body.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = href;
      }, 650); // match nav + body transition timing
    }
  });
});
