const loadingScreen = document.getElementById("loading-screen");

if (loadingScreen) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
    }, 1000);
  });
}

const imageUrlInput = document.getElementById("image-url");
const loadImageButton = document.getElementById("load-image");
const resetImageButton = document.getElementById("reset-image");
const previewImage = document.getElementById("preview-image");
const defaultImageUrl = "favicon.svg";

function applyImage(url) {
  const safeUrl = url && url.trim() ? url.trim() : defaultImageUrl;

  if (!previewImage) {
    return;
  }

  previewImage.src = safeUrl;
  previewImage.alt =
    safeUrl === defaultImageUrl
      ? "Default profile image"
      : "Custom profile image";

  if (imageUrlInput) {
    imageUrlInput.value = safeUrl === defaultImageUrl ? "" : safeUrl;
  }

  if (safeUrl === defaultImageUrl) {
    localStorage.removeItem("homepageImageUrl");
  } else {
    localStorage.setItem("homepageImageUrl", safeUrl);
  }
}

function loadImageFromUrl() {
  if (!imageUrlInput) {
    return;
  }

  const userUrl = imageUrlInput.value.trim();
  applyImage(userUrl);
}

function resetImage() {
  applyImage(defaultImageUrl);
}

const savedImageUrl = localStorage.getItem("homepageImageUrl");
applyImage(savedImageUrl || defaultImageUrl);

if (loadImageButton) {
  loadImageButton.addEventListener("click", loadImageFromUrl);
}

if (resetImageButton) {
  resetImageButton.addEventListener("click", resetImage);
}

if (imageUrlInput) {
  imageUrlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadImageFromUrl();
    }
  });
}
