document.addEventListener("DOMContentLoaded", () => {
  const existingLayer = document.getElementById("space-background");

  if (existingLayer) {
    existingLayer.remove();
  }

  const layer = document.createElement("div");
  layer.id = "space-background";
  layer.setAttribute("aria-hidden", "true");

  const dotCount = window.innerWidth < 700 ? 48 : 90;

  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement("span");
    dot.className = "space-dot";

    const size = (Math.random() * 3 + 1.5).toFixed(2) + "px";
    const top = (Math.random() * 100).toFixed(2) + "%";
    const duration = (Math.random() * 7 + 5).toFixed(2) + "s";
    const delay = (Math.random() * 4).toFixed(2) + "s";
    const drift = (Math.random() * 30 - 15).toFixed(2) + "px";
    const angle = (Math.random() * 180 - 90).toFixed(2) + "deg";

    dot.style.setProperty("--size", size);
    dot.style.setProperty("--top", top);
    dot.style.setProperty("--duration", duration);
    dot.style.setProperty("--delay", delay);
    dot.style.setProperty("--drift", drift);
    dot.style.setProperty("--angle", angle);

    layer.appendChild(dot);
  }

  document.body.prepend(layer);
});
