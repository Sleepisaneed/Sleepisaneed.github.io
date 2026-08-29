const quotes = [
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
  {
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
  },
  {
    text: "Let everything that has breath praise the Lord.",
    reference: "Psalm 150:6",
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13",
  },
  { text: "Trust in the Lord with all your heart.", reference: "Proverbs 3:5" },
  {
    text: "The peace of God surpasses all understanding.",
    reference: "Philippians 4:7",
  },
  {
    text: "For God so loved the world, that he gave his only Son.",
    reference: "John 3:16",
  },
  { text: "Taste and see that the Lord is good.", reference: "Psalm 34:8" },
  {
    text: "The steadfast love of the Lord never ceases.",
    reference: "Lamentations 3:22",
  },
  {
    text: "Be strong and courageous. Do not be afraid.",
    reference: "Joshua 1:9",
  },
  {
    text: "In his presence there is fullness of joy.",
    reference: "Psalm 16:11",
  },
  { text: "The Lord is near to the brokenhearted.", reference: "Psalm 34:18" },
];

const quoteTextEl = document.getElementById("daily-quote-text");
const quoteReferenceEl = document.getElementById("daily-quote-reference");

if (quoteTextEl && quoteReferenceEl) {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayIndex = Math.floor(diff / oneDay);
  const quote = quotes[dayIndex % quotes.length];

  const quoteDateEl = document.getElementById("quote-date");
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(today);

  if (quoteDateEl) {
    quoteDateEl.textContent = formattedDate;
  }

  quoteTextEl.textContent = `“${quote.text}”`;
  quoteReferenceEl.textContent = quote.reference;
}
