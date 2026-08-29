document.addEventListener("DOMContentLoaded", () => {
  const galleryFigures = document.querySelectorAll(".image-gallery figure");
  const resetButton = document.getElementById("gallery-reset-btn");
  const body = document.body;

  const clearBackground = () => {
    localStorage.removeItem("siteBackgroundImage");
    body.style.backgroundImage = "";
    body.style.backgroundSize = "";
    body.style.backgroundPosition = "";
    body.style.backgroundRepeat = "";
    body.style.backgroundAttachment = "";
  };

  const setBackground = (imageUrl) => {
    localStorage.setItem("siteBackgroundImage", imageUrl);
    body.style.backgroundImage = `linear-gradient(rgba(2, 13, 26, 0.6), rgba(2, 13, 26, 0.7)), url("${imageUrl}")`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";
  };

  const storedImage = localStorage.getItem("siteBackgroundImage");

  if (storedImage) {
    setBackground(storedImage);
  }

  galleryFigures.forEach((figure) => {
    const image = figure.querySelector("img");

    if (!image) return;

    figure.addEventListener("click", () => {
      setBackground(image.src);
    });
  });

  resetButton?.addEventListener("click", clearBackground);
});
