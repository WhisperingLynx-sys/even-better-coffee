// === CONFIGURATION ===
const coffees = [
  { name: "ESPRESSO", color: "#6f4e37", isIced: false },
  { name: "LATE", color: "#8b5a2b", isIced: false },
  { name: "CAPPUCCINO", color: "#a07b55", isIced: false },
  { name: "ICED COFFEE", color: "#557799", isIced: true },
  { name: "MOCHA", color: "#5c3c25", isIced: false },
  { name: "AMERICANO", color: "#7d5a40", isIced: false },
  { name: "FRENCH PRESS", color: "#906b4c", isIced: false },
  { name: "NITRO COLD BREW", color: "#4a5a7a", isIced: true },
  { name: "MATCHA", color: "#5f8c5f", isIced: true },
  { name: "CHAI LATTE", color: "#b47b5a", isIced: false },
];

let currentCoffeeIndex = 0;
let isBrewing = false;
let timerInterval;

// === DOM ELEMENTS ===
const cup = document.getElementById("cup");
const pourCanvas = document.getElementById("pourCanvas");
const steamParticles = document.getElementById("steamParticles");
const iceCube = document.getElementById("iceCube");
const nameTag = document.getElementById("nameTag");
const displayText = document.getElementById("displayText");
const timer = document.getElementById("timer");
const blush = document.getElementById("blush");
const thankYou = document.getElementById("thankYou");
const kissButton = document.getElementById("kissButton");
const nameInput = document.getElementById("nameInput");
const loveFill = document.getElementById("loveFill");

// === STATE ===
let currentName = "My Love";
let loveLevel = 0;

// === INITIALIZATION ===
function init() {
  // Set initial coffee
  updateDisplay();

  // Update name
  nameInput.addEventListener("input", () => {
    currentName = nameInput.value || "My Love";
    updateNameTag(currentName);
  });

  // Auto-start after 2 seconds
  setTimeout(() => {
    startBrew();
  }, 2000);

  // Load voices
  window.speechSynthesis.onvoiceschanged = () => {};

  // Initialize love meter
  gsap.to(loveFill, { width: "0%", duration: 0 });
}

// === ANIMATIONS ===
function updateDisplay() {
  const coffee = coffees[currentCoffeeIndex];
  displayText.textContent = coffee.name;
  document.body.style.backgroundColor = coffee.isIced ? "#d0e8f5" : "#f0e0d0";
}

function updateNameTag(name) {
  const tag = document.getElementById("nameTag");
  tag.classList.remove("typewriter");
  tag.innerText = name;
  void tag.offsetWidth;
  tag.classList.add("typewriter");
}

function startBrew() {
  if (isBrewing) return;
  isBrewing = true;

  // Reset
  gsap.set(pourCanvas, { opacity: 0 });
  gsap.set(steamParticles, { opacity: 0 });
  gsap.set(iceCube, { opacity: 0 });

  // Show timer
  let timeLeft = 10;
  timer.textContent = timeLeft;
  timer.style.opacity = 1;

  // Start timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      completeBrew();
    }
  }, 1000);

  // Play sounds
  playSound("clinkSound");
  if (!coffees[currentCoffeeIndex].isIced) playSound("steamSound");

  // Slide in cup
  gsap.to(cup, { opacity: 1, duration: 0.8, ease: "back.out(1.2)" });
}

function completeBrew() {
  const coffee = coffees[currentCoffeeIndex];
  const ctx = pourCanvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, 80, 120);

  // Draw pour with unique color
  const gradient = ctx.createLinearGradient(0, 0, 0, 120);
  gradient.addColorStop(0, coffee.color);
  gradient.addColorStop(1, coffee.color + "aa"); // semi-transparent

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 80, 120);

  // Add drip effect
  if (coffee.isIced) {
    createIceDrops();
    gsap.to(iceCube, { opacity: 1, duration: 0.6 });
  } else {
    gsap.to(steamParticles, { opacity: 1, duration: 0.6 });
  }

  // Show pour
  gsap.to(pourCanvas, { opacity: 1, duration: 0.8 });

  // After pour, show kiss button
  setTimeout(() => {
    showKissButton();
  }, 1000);

  // Speak
  speak(`Fresh ${coffee.name} just for you, my love.`);

  isBrewing = false;
}

function createIceDrops() {
  for (let i = 0; i < 5; i++) {
    const drop = document.createElement("div");
    drop.classList.add("ice-drop");
    drop.style.left = `${Math.random() * 30 + 25}px`;
    drop.style.top = `${Math.random() * 20 + 10}px`;
    drop.style.animationDelay = `${Math.random() * 1}s`;
    drop.style.opacity = Math.random() * 0.7 + 0.3;
    iceCube.appendChild(drop);
  }
}

function showKissButton() {
  gsap.to(kissButton, { opacity: 1, duration: 0.6, ease: "bounce.out" });
  kissButton.addEventListener("click", () => {
    kissButton.style.transform = "scale(0.8)";
    setTimeout(() => {
      kissButton.style.transform = "scale(1)";
    }, 100);

    gsap.to(blush, { opacity: 1, duration: 0.5 });
    gsap.to(thankYou, { opacity: 1, duration: 1, delay: 0.5 });
    increaseLove();
    launchConfetti();
  });
}

function launchConfetti() {
  const confetti = document.createElement("div");
  confetti.style.position = "fixed";
  confetti.style.top = "0";
  confetti.style.left = "0";
  confetti.style.width = "100%";
  confetti.style.height = "100%";
  confetti.style.pointerEvents = "none";
  confetti.style.zIndex = "9999";
  document.body.appendChild(confetti);

  for (let i = 0; i < 150; i++) {
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.width = Math.random() * 8 + 4 + "px";
    particle.style.height = particle.style.width;
    particle.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
    particle.style.borderRadius = "50%";
    particle.style.opacity = Math.random() * 0.7 + 0.3;
    particle.style.transform = `translate(${Math.random() * window.innerWidth}px, -10px)`;
    particle.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        to { transform: translate(${Math.random() * window.innerWidth}px, ${window.innerHeight + 100}px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    confetti.appendChild(particle);
  }

  setTimeout(() => {
    confetti.remove();
  }, 5000);
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    utterance.lang = 'en-US';
    
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
    if (femaleVoice) utterance.voice = femaleVoice;

    speechSynthesis.speak(utterance);
  }
}

function playSound(id) {
  const audio = document.getElementById(id);
  audio.currentTime = 0;
  audio.play().catch(e => console.log("Audio play failed:", e));
}

function increaseLove() {
  loveLevel += 10;
  if (loveLevel > 100) loveLevel = 100;
  loveFill.style.width = loveLevel + "%";

  if (loveLevel >= 50) {
    speak("You're warming my heart… I'm melting!");
  } else if (loveLevel >= 80) {
    speak("I think I’m falling for you… permanently.");
  } else if (loveLevel >= 100) {
    speak("You’re not just my favorite… you’re my only.");
  }
}

// Arrow Navigation
document.querySelector('.machine-svg').addEventListener('click', (e) => {
  const rect = document.querySelector('.machine-svg').getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Left arrow
  if (x > 100 && x < 115 && y > 240 && y < 260) {
    currentCoffeeIndex = (currentCoffeeIndex - 1 + coffees.length) % coffees.length;
    updateDisplay();
  }
  // Right arrow
  else if (x > 185 && x < 200 && y > 240 && y < 260) {
    currentCoffeeIndex = (currentCoffeeIndex + 1) % coffees.length;
    updateDisplay();
  }
});

// Initialize
window.onload = init;