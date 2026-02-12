// ===========================
// Restaurant Data
// ===========================
const restaurants = [
  // SSR (激レア) - 3件
  { name: "叙々苑", rarity: "SSR", genre: "焼肉" },
  { name: "回らない寿司屋", rarity: "SSR", genre: "寿司" },
  { name: "うかい亭", rarity: "SSR", genre: "鉄板焼き" },

  // SR (レア) - 5件
  { name: "ロイヤルホスト", rarity: "SR", genre: "ファミレス" },
  { name: "丸亀製麺", rarity: "SR", genre: "うどん" },
  { name: "スシロー", rarity: "SR", genre: "回転寿司" },
  { name: "焼肉きんぐ", rarity: "SR", genre: "焼肉" },
  { name: "びっくりドンキー", rarity: "SR", genre: "ハンバーグ" },

  // R (ちょっと良い) - 6件
  { name: "大戸屋", rarity: "R", genre: "定食" },
  { name: "餃子の王将", rarity: "R", genre: "中華" },
  { name: "CoCo壱番屋", rarity: "R", genre: "カレー" },
  { name: "リンガーハット", rarity: "R", genre: "ちゃんぽん" },
  { name: "やよい軒", rarity: "R", genre: "定食" },
  { name: "天下一品", rarity: "R", genre: "ラーメン" },

  // N (いつもの) - 8件
  { name: "マクドナルド", rarity: "N", genre: "ファストフード" },
  { name: "吉野家", rarity: "N", genre: "牛丼" },
  { name: "松屋", rarity: "N", genre: "牛丼" },
  { name: "すき家", rarity: "N", genre: "牛丼" },
  { name: "日高屋", rarity: "N", genre: "中華" },
  { name: "サイゼリヤ", rarity: "N", genre: "イタリアン" },
  { name: "なか卯", rarity: "N", genre: "丼もの" },
  { name: "かつや", rarity: "N", genre: "とんかつ" },
];

// ===========================
// Rarity Probability Table
// ===========================
const RARITY_WEIGHTS = [
  { rarity: "SSR", probability: 0.05 },
  { rarity: "SR",  probability: 0.15 },
  { rarity: "R",   probability: 0.30 },
  { rarity: "N",   probability: 0.50 },
];

// ===========================
// Seeded Random Number Generator (mulberry32)
// ===========================
const createSeededRandom = (seed) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ===========================
// Gacha Logic
// ===========================
const pickRestaurant = (seed) => {
  const random = createSeededRandom(seed);

  // First roll: determine rarity
  const rarityRoll = random();
  let cumulative = 0;
  let selectedRarity = "N";

  for (const { rarity, probability } of RARITY_WEIGHTS) {
    cumulative += probability;
    if (rarityRoll < cumulative) {
      selectedRarity = rarity;
      break;
    }
  }

  // Second roll: pick a restaurant from that rarity
  const candidates = restaurants.filter((r) => r.rarity === selectedRarity);
  const index = Math.floor(random() * candidates.length);
  return candidates[index];
};

// ===========================
// DOM Elements
// ===========================
const $ = (selector) => document.querySelector(selector);

const gachaSection   = $("#gacha-section");
const rollingSection = $("#rolling-section");
const resultSection  = $("#result-section");
const gachaButton    = $("#gacha-button");
const rollingText    = $("#rolling-text");
const resultCard     = $("#result-card");
const resultName     = $("#result-name");
const resultGenre    = $("#result-genre");
const rarityBadge    = $("#result-rarity-badge");
const mapsButton     = $("#maps-button");
const shareButton    = $("#share-button");
const retryButton    = $("#retry-button");
const shareToast     = $("#share-toast");

// ===========================
// Display Result
// ===========================
const showResult = (restaurant) => {
  resultCard.setAttribute("data-rarity", restaurant.rarity);
  rarityBadge.textContent = restaurant.rarity;
  resultName.textContent = restaurant.name;
  resultGenre.textContent = `🍴 ${restaurant.genre}`;

  const mapQuery = encodeURIComponent(restaurant.name);
  mapsButton.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  gachaSection.classList.add("hidden");
  rollingSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  // SSR gets special effects
  if (restaurant.rarity === "SSR") {
    launchSSREffects();
  }
};

// ===========================
// Rolling Animation
// ===========================
const ROLLING_DURATION = 2500;
const ROLLING_INTERVAL = 80;

const rollingEmojis = ["🍔", "🍣", "🍜", "🍛", "🥩", "🍕", "🍱", "🍙", "🥗", "🍝", "🍤", "🥘", "🍲", "🥟"];

const playRollingAnimation = (seed) => {
  gachaSection.classList.add("hidden");
  rollingSection.classList.remove("hidden");

  let elapsed = 0;
  let emojiIndex = 0;

  const interval = setInterval(() => {
    rollingText.textContent = rollingEmojis[emojiIndex % rollingEmojis.length];
    emojiIndex++;
    elapsed += ROLLING_INTERVAL;

    if (elapsed >= ROLLING_DURATION) {
      clearInterval(interval);
      const result = pickRestaurant(seed);
      showResult(result);
    }
  }, ROLLING_INTERVAL);
};

// ===========================
// SSR Effects (Flash + Confetti)
// ===========================
const launchSSREffects = () => {
  // Screen flash
  const flash = document.createElement("div");
  flash.className = "ssr-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);

  // Confetti
  launchConfetti();
};

// ===========================
// Confetti Effect (SSR only)
// ===========================
const launchConfetti = () => {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  const colors = ["#ffd700", "#ff6b6b", "#3db8f5", "#bf6dff", "#ffc973", "#ff8e53", "#2cc96b"];

  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = `${1.5 + Math.random() * 2.5}s`;
    confetti.style.animationDelay = `${Math.random() * 0.8}s`;
    confetti.style.width = `${5 + Math.random() * 8}px`;
    confetti.style.height = `${5 + Math.random() * 8}px`;
    // Mix of shapes
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = "50%";
    }
    container.appendChild(confetti);
  }

  setTimeout(() => container.remove(), 5000);
};

// ===========================
// Share & Copy URL
// ===========================
const copyShareUrl = (seed) => {
  const url = new URL(window.location.href);
  url.searchParams.set("seed", seed);
  const shareUrl = url.toString();

  navigator.clipboard.writeText(shareUrl).then(() => {
    shareToast.classList.remove("hidden");
    // Reset animation by forcing reflow
    shareToast.style.animation = "none";
    shareToast.offsetHeight; // trigger reflow
    shareToast.style.animation = "";

    setTimeout(() => shareToast.classList.add("hidden"), 2500);
  });
};

// ===========================
// Event Handlers
// ===========================
let currentSeed = null;

gachaButton.addEventListener("click", () => {
  currentSeed = Date.now();
  // Update URL without reload
  const url = new URL(window.location.href);
  url.searchParams.set("seed", currentSeed);
  window.history.replaceState(null, "", url.toString());

  playRollingAnimation(currentSeed);
});

shareButton.addEventListener("click", () => {
  if (currentSeed !== null) {
    copyShareUrl(currentSeed);
  }
});

retryButton.addEventListener("click", () => {
  // Reset UI
  resultSection.classList.add("hidden");
  gachaSection.classList.remove("hidden");
});

// ===========================
// On Load: Check URL for shared seed
// ===========================
const init = () => {
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");

  if (seedParam !== null) {
    const seed = Number(seedParam);
    if (!Number.isNaN(seed)) {
      currentSeed = seed;
      const result = pickRestaurant(seed);
      // Show result immediately (no animation) for shared links
      showResult(result);
      return;
    }
  }

  // Default: show gacha button
  gachaSection.classList.remove("hidden");
  rollingSection.classList.add("hidden");
  resultSection.classList.add("hidden");
};

init();
