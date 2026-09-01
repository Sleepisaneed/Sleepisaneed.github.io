const pageInfo = {
  home: {
    title: "Home page",
    intro:
      "This page is a simple landing page with a custom background, a loading screen, and a content layout.",
    pieces: [
      "A fixed background made with CSS gradients and animated dots.",
      "A loading screen that fades in and out while the page opens.",
      "A two-column layout with a photo box and text content.",
      "A button that lets someone upload an image URL into the preview box.",
    ],
    steps: [
      "Use a basic HTML layout with a sidebar and content area.",
      "Style the background with gradients and a repeating grid.",
      "Add a small image preview box and input field.",
      "Use JavaScript to replace the image source when the button is clicked.",
    ],
    code: [
      {
        label: "Navigation bar",
        code: '<nav>\n  <h1>M-Print: Home</h1>\n  <ul>\n    <li><a href="index.html">Home</a></li>\n    <li><a href="portfolio.html">Portfolio</a></li>\n  </ul>\n</nav>',
      },
      {
        label: "Main page layout",
        code: '<main>\n  <div class="sidebar">\n    <div class="sidebar-photo-box">\n      <img src="favicon.svg" />\n    </div>\n  </div>\n\n  <div class="content">\n    <h2>Brice</h2>\n    <p>Student at CHS</p>\n  </div>\n</main>',
      },
      {
        label: "Image upload box",
        code: '<label for="image-url">Paste an image URL</label>\n<input id="image-url" type="url" />\n<button id="load-image">Load image</button>',
      },
      {
        label: "CSS background",
        code: ".space-dot {\n  position: absolute;\n  width: var(--size);\n  height: var(--size);\n  border-radius: 50%;\n  animation: space-fly var(--duration) linear infinite;\n}\n\n@keyframes space-fly {\n  0% { transform: translate3d(0, 0, 0); opacity: 0; }\n  100% { transform: translate3d(120vw, 20vh, 0); opacity: 0; }\n}",
      },
      {
        label: "JavaScript for image loading",
        code: 'const input = document.getElementById("image-url");\nconst preview = document.getElementById("preview-image");\n\ndocument.getElementById("load-image").addEventListener("click", () => {\n  preview.src = input.value;\n});',
      },
    ],
  },
  portfolio: {
    title: "Portfolio page",
    intro:
      "This page combines a portfolio list with a mini-game scroller, so the user can browse projects and switch between games.",
    pieces: [
      "A portfolio list on the left side of the page.",
      "A game section on the right with several slides.",
      "Previous and next buttons to move between games.",
      "A small CSS trick that keeps only one slide visible at a time.",
    ],
    steps: [
      "Create a container with multiple slides inside it.",
      "Hide every slide by default with CSS.",
      "Add one active class to the slide currently being shown.",
      "Use JavaScript to update the active class when a button is pressed.",
    ],
    code: [
      {
        label: "Portfolio list",
        code: '<ul id="portfolio">\n  <li><a href="fsd-projects/platformer/">Platformer</a></li>\n  <li><a href="fsd-projects/runtime/">Runtime</a></li>\n</ul>',
      },
      {
        label: "Game scroller HTML",
        code: '<button id="game-prev-btn">▲</button>\n\n<div class="game-slide is-active">Game 1</div>\n<div class="game-slide">Game 2</div>\n<div class="game-slide">Game 3</div>\n\n<button id="game-next-btn">▼</button>',
      },
      {
        label: "CSS for slide switching",
        code: ".game-slide { display: none; }\n.game-slide.is-active { display: block; }",
      },
      {
        label: "JavaScript for next/previous",
        code: 'const slides = [...document.querySelectorAll(".game-slide")];\nlet currentIndex = 0;\n\nfunction showSlide(index) {\n  slides.forEach((slide, i) => {\n    slide.classList.toggle("is-active", i === index);\n  });\n}\n\ndocument.getElementById("game-next-btn").addEventListener("click", () => {\n  currentIndex = (currentIndex + 1) % slides.length;\n  showSlide(currentIndex);\n});',
      },
      {
        label: "Score board",
        code: '<div class="game-scoreboard">\n  <div class="score-pill"><span>Score</span><strong id="game-score">0</strong></div>\n  <div class="score-pill"><span>Best</span><strong id="game-best">0</strong></div>\n</div>',
      },
    ],
  },
  gallery: {
    title: "Gallery page",
    intro:
      "This page is a photo gallery with big images, a quote panel, and a reset button for the background.",
    pieces: [
      "A gallery grid that displays multiple images in rows.",
      "A quote box that changes each day.",
      "A simple button that resets the layout background.",
      "A responsive layout so it works on smaller screens too.",
    ],
    steps: [
      "Use CSS Grid to lay out the gallery images.",
      "Add figure and figcaption tags to each photo.",
      "Style the quote box with a border and a different background color.",
      "Use JavaScript to swap the quote or reset the design when needed.",
    ],
    code: [
      {
        label: "Gallery grid",
        code: '<div class="image-gallery">\n  <figure>\n    <img src="photo1.jpg" alt="Forest">\n    <figcaption>Forest glow</figcaption>\n  </figure>\n  <figure>\n    <img src="photo2.jpg" alt="Lake">\n    <figcaption>Quiet lake</figcaption>\n  </figure>\n</div>',
      },
      {
        label: "CSS Grid",
        code: ".image-gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n\n.image-gallery img {\n  width: 100%;\n  aspect-ratio: 4 / 3;\n  object-fit: cover;\n}",
      },
      {
        label: "Quote card",
        code: '<aside class="daily-quote">\n  <p class="quote-date">Today</p>\n  <blockquote>\n    <p id="daily-quote-text">Stay calm.</p>\n  </blockquote>\n</aside>',
      },
      {
        label: "JavaScript for quote or reset",
        code: 'const quoteText = document.getElementById("daily-quote-text");\nquoteText.textContent = "A new idea for the day";\n\ndocument.getElementById("gallery-reset-btn").addEventListener("click", () => {\n  document.body.classList.remove("special-mode");\n});',
      },
    ],
  },
  schedule: {
    title: "Schedule page",
    intro:
      "This page uses a list of schedule cards, each card contains a subject and a few details about that part of the week.",
    pieces: [
      "A main heading and short paragraph at the top.",
      "A vertical stack of boxes for each class or activity.",
      "Rows of bold labels and text inside each card.",
      "A simple container layout with spacing between cards.",
    ],
    steps: [
      "Create a list and then add a card for each item.",
      "Use a flex column to stack the cards vertically.",
      "Add headings, paragraphs, and bold labels inside each box.",
      "Use padding and borders to make the schedule easy to read.",
    ],
    code: [
      {
        label: "Schedule list",
        code: '<ul class="schedule-list">\n  <li class="schedule-box">\n    <h2>Band</h2>\n    <p><strong>Tuesday:</strong> Practice</p>\n  </li>\n  <li class="schedule-box">\n    <h2>Geography</h2>\n    <p><strong>Monday:</strong> Quiz</p>\n  </li>\n</ul>',
      },
      {
        label: "CSS layout",
        code: ".schedule-list {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n}\n\n.schedule-box {\n  padding: 24px;\n  border: 1px solid coral;\n  border-radius: 12px;\n  background: rgba(0, 0, 0, 0.16);\n}",
      },
      {
        label: "Card text styling",
        code: '.schedule-box h2 { color: coral; }\n.schedule-box strong { color: white; }\n.schedule-box p { color: #ffe2d7; }',
      },
      {
        label: "Why it works",
        code: "Each item is just a box.\nThe flex column stacks them neatly.\nThe border and spacing make the page easy to scan.",
      },
    ],
  },
};

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildCopyTip(block) {
  if (block.tip) {
    return block.tip;
  }

  return "Copy this block into your own page, then change the text, links, and image names so it matches your website.";
}

function buildPageInfoMarkup(info) {
  const pieces = info.pieces.map((piece) => `<li>${piece}</li>`).join("");
  const codeBlocks = info.code
    .map(
      (block) => `
    <div class="build-info-code-block">
      <h4>${block.label}</h4>
      <pre><code>${escapeHtml(block.code)}</code></pre>
      <p class="build-info-copy-tip"><strong>How to copy this:</strong> ${buildCopyTip(block)}</p>
    </div>
  `,
    )
    .join("");

  return `
    <div class="build-info-panel">
      <div class="build-info-header">
        <p class="build-info-label">Build guide</p>
        <h3>${info.title}</h3>
      </div>

      <p class="build-info-intro">${info.intro}</p>

      <div class="build-info-section">
        <h4>What is on this page?</h4>
        <ul>${pieces}</ul>
      </div>

      <div class="build-info-section">
        <h4>How it was built</h4>
        <ol>
          ${info.steps.map((step) => `<li>${step}</li>`).join("")}
        </ol>
      </div>

      <div class="build-info-section">
        <h4>Very simplified code</h4>
        ${codeBlocks}
      </div>
    </div>
  `;
}

function bindPageInfo() {
  const pageName = document.body.dataset.page || "home";
  const info = pageInfo[pageName] || pageInfo.home;

  let button = document.getElementById("build-info-button");
  let modal = document.getElementById("build-info-modal");

  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.id = "build-info-button";
    button.className = "build-info-button";
    button.textContent = "How this page was built";
    document.body.appendChild(button);
  }

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "build-info-modal";
    modal.className = "build-info-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="build-info-backdrop" aria-hidden="true"></div>
    <div class="build-info-window" role="dialog" aria-modal="true" aria-labelledby="build-info-title">
      ${buildPageInfoMarkup(info)}
      <button type="button" class="build-info-close" aria-label="Close info box">Close</button>
    </div>
  `;

  const closeButton = modal.querySelector(".build-info-close");
  const backdrop = modal.querySelector(".build-info-backdrop");

  button.addEventListener("click", () => {
    modal.classList.add("is-open");
    document.body.classList.add("build-info-locked");
  });

  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.classList.remove("build-info-locked");
  };

  backdrop.addEventListener("click", closeModal);
  closeButton.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", bindPageInfo);
