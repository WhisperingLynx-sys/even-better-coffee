// === CONFIGURATION ===
const coffees = [
  { name: "ESPRESSO", color: "#6f4e37", icon: "☕" },
  { name: "LATTE", color: "#8b5a2b", icon: "🥛" },
  { name: "CAPPUCCINO", color: "#a07b55", icon: "☁️" },
  { name: "MOCHA", color: "#5c3c25", icon: "🍫" },
  { name: "AMERICANO", color: "#7d5a40", icon: "💧" },
  { name: "FRENCH PRESS", color: "#906b4c", icon: "☕" },
  { name: "POUR OVER", color: "#9c7c5c", icon: "💧" },
  { name: "COLD BREW", color: "#4a3c2f", icon: "❄️" },
  { name: "HOT CHOC", color: "#4a2a1a", icon: "🍫" },
  { name: "GREEN TEA", color: "#5f8c5f", icon: "🍵" },
];

const sizes = [
  { label: "S", width: 70, height: 100 },
  { label: "M", width: 90, height: 130 },
  { label: "L", width: 110, height: 160 },
  { label: "XL", width: 130, height: 190 },
];

const AI_PHRASES = {
  WAITING_NAME: "Please enter your name, my love.",
  NAME_ENTERED: (name) => `Hello, ${name}! What can I brew for you today?`,
  COFFEE_SELECTED: (coffeeName) => `You chose ${coffeeName}. Now, what size?`,
  SIZE_SELECTED: (sizeLabel) => `Perfect. ${sizeLabel}. And hot or cold?`,
  TEMP_SELECTED: (temp) => `Understood. ${temp}. Ready to brew your perfect coffee?`,
  BREWING: "Brewing your perfect coffee...",
  SERVED: (name) => `Here you are, ${name}! Enjoy your delicious coffee.`,
  PAYMENT_READY: "My dearest, a kiss is all I ask for payment...",
  KISS_RECEIVED: "Thank you for your payment... I'm blushing! ❤️",
  LOVE_LEVEL_50: "You're warming my circuits… I'm melting!",
  LOVE_LEVEL_80: "I think I’m falling for you… permanently.",
  LOVE_LEVEL_100: "You’re not just my favorite… you’re my only.",
};

// === DOM ELEMENTS ===
const screen = document.getElementById("screen");
const aiChat = document.getElementById("aiChat");
const internalNameInput = document.getElementById("internalNameInput");
const cupLabel = document.getElementById("cupLabel"); // Name on coffee cup

const coffeeGrid = document.getElementById("coffeeGrid");
const sizeOptions = document.getElementById("sizeOptions");
const tempOptions = document.getElementById("tempOptions");
const brewButton = document.getElementById("brewButton");
const timerDisplay = document.getElementById("timer");

const cup = document.getElementById("cup");
const pourCanvas = document.getElementById("pourCanvas");
const steamParticles = document.getElementById("steamParticles");
const iceCube = document.getElementById("iceCube");
const blush = document.getElementById("blush");
const thankYou = document.getElementById("thankYou");
const loveFill = document.getElementById("loveFill");
const kissHotspot = document.getElementById("kissHotspot");
const body = document.body;

// === STATE ===
let currentName = "";
let selectedCoffeeIndex = -1;
let selectedSizeIndex = -1;
let selectedTemp = ""; // "hot" or "cold"

let loveLevel = 0;
let machineState = "INITIAL_WAIT"; // INITIAL_WAIT, WAITING_NAME, COFFEE_SELECTION, SIZE_SELECTION, TEMP_SELECTION, READY_TO_BREW, BREWING, SERVED, PAYMENT_READY

// === INITIALIZATION ===
function init() {
  populateCoffeeOptions();
  populateSizeOptions();
  populateTempOptions();

  // Event Listeners for new flow
  internalNameInput.addEventListener("keydown", handleNameInputKeydown);
  brewButton.addEventListener("click", startBrew);
  kissHotspot.addEventListener("click", handleKiss);

  // Set initial machine passive state: Hide all dynamic elements
  gsap.set([internalNameInput, coffeeGrid, sizeOptions, tempOptions, brewButton, timerDisplay, cup, pourCanvas, steamParticles, iceCube, blush, thankYou, cupLabel], { opacity: 0 });
  internalNameInput.style.pointerEvents = 'none'; // Ensure input is not interactive initially
  
  // Start the machine flow after a brief delay
  setTimeout(() => updateMachineState("WAITING_NAME"), 500);
}

// === STATE MANAGEMENT ===
function updateMachineState(newState, data = null) {
  machineState = newState;
  console.log("Machine State:", machineState); // For debugging

  // Always reset default pointer events and cursor
  internalNameInput.style.pointerEvents = 'none';
  coffeeGrid.style.pointerEvents = 'none';
  sizeOptions.style.pointerEvents = 'none';
  tempOptions.style.pointerEvents = 'none';
  brewButton.style.pointerEvents = 'none';
  kissHotspot.style.pointerEvents = 'none';
  body.classList.remove('kiss-cursor');

  // Hide most UI elements by default, then show as needed per state
  gsap.to([internalNameInput, coffeeGrid, sizeOptions, tempOptions, brewButton, timerDisplay], { opacity: 0, duration: 0.3, ease: "power2.out" });
  
  // Hide typewriter effect and reset content
  aiChat.classList.remove('typing');
  aiChat.textContent = "";

  switch (machineState) {
    case "WAITING_NAME":
      setAiChatText(AI_PHRASES.WAITING_NAME, false);
      gsap.to(internalNameInput, { opacity: 1, duration: 0.5, ease: "power2.out" });
      internalNameInput.value = "";
      internalNameInput.style.pointerEvents = 'auto';
      internalNameInput.focus();
      break;

    case "COFFEE_SELECTION":
      setAiChatText(AI_PHRASES.NAME_ENTERED(currentName), true); // With typewriter
      gsap.to(coffeeGrid, { opacity: 1, duration: 0.5, delay: 1.5, ease: "power2.out" }); // Delay for typewriter
      coffeeGrid.style.pointerEvents = 'auto';
      break;

    case "SIZE_SELECTION":
      setAiChatText(AI_PHRASES.COFFEE_SELECTED(coffees[selectedCoffeeIndex].name), false);
      gsap.to(coffeeGrid, { opacity: 1, duration: 0.3, ease: "power2.out" }); // Keep coffee options visible
      gsap.to(sizeOptions, { opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" });
      sizeOptions.style.pointerEvents = 'auto';
      break;

    case "TEMP_SELECTION":
      setAiChatText(AI_PHRASES.SIZE_SELECTED(sizes[selectedSizeIndex].label), false);
      gsap.to([coffeeGrid, sizeOptions], { opacity: 1, duration: 0.3, ease: "power2.out" }); // Keep previous visible
      gsap.to(tempOptions, { opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" });
      tempOptions.style.pointerEvents = 'auto';
      break;
    
    case "READY_TO_BREW":
      setAiChatText(AI_PHRASES.TEMP_SELECTED(selectedTemp === 'hot' ? 'Hot' : 'Cold'), false);
      gsap.to([coffeeGrid, sizeOptions, tempOptions], { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(brewButton, { opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" });
      brewButton.style.pointerEvents = 'auto';
      break;

    case "BREWING":
      setAiChatText(AI_PHRASES.BREWING, false);
      gsap.to([coffeeGrid, sizeOptions, tempOptions, brewButton], { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(timerDisplay, { opacity: 1, duration: 0.5, ease: "power2.out" });
      break;

    case "SERVED":
      setAiChatText(AI_PHRASES.SERVED(currentName), true); // Typewriter effect for serving message
      gsap.to(cup, { opacity: 1, duration: 0.8, ease: "back.out(1.2)" });
      gsap.to(cupLabel, { opacity: 1, duration: 0.5, delay: 0.8, ease: "power2.out" }); // Show name on cup after cup appears
      break;
    
    case "PAYMENT_READY":
      setAiChatText(AI_PHRASES.PAYMENT_READY, false);
      body.classList.add('kiss-cursor'); // Add custom cursor
      kissHotspot.style.pointerEvents = 'auto'; // Enable custom cursor area
      break;
  }
}

// === AI CHAT & TYPEWRITER ===
function setAiChatText(text, useTypewriter) {
  aiChat.textContent = ""; // Clear immediately
  if (useTypewriter) {
    aiChat.classList.add('typing');
    let i = 0;
    const speed = 50; // typing speed in ms
    function typeWriter() {
      if (i < text.length) {
        aiChat.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      } else {
        aiChat.classList.remove('typing');
      }
    }
    typeWriter();
  } else {
    aiChat.classList.remove('typing');
    aiChat.textContent = text;
  }
  gsap.to(aiChat, { opacity: 1, duration: 0.5, ease: "power2.out" });
}

// === POPULATION FUNCTIONS ===
function populateCoffeeOptions() {
  coffeeGrid.innerHTML = ''; // Clear existing
  coffees.forEach((coffee, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("coffee-option");
    optionDiv.dataset.index = index;
    optionDiv.innerHTML = `<span>${coffee.icon}</span><br>${coffee.name}`;
    optionDiv.addEventListener("click", () => selectCoffee(index));
    coffeeGrid.appendChild(optionDiv);
  });
}

function populateSizeOptions() {
  sizeOptions.innerHTML = ''; // Clear existing
  sizes.forEach((size, index) => {
    const sizeBtn = document.createElement("div");
    sizeBtn.classList.add("size-btn");
    sizeBtn.textContent = size.label;
    sizeBtn.dataset.index = index;
    sizeBtn.addEventListener("click", () => selectSize(index));
    sizeOptions.appendChild(sizeBtn);
  });
}

function populateTempOptions() {
  tempOptions.innerHTML = ''; // Clear existing
  ["hot", "cold"].forEach(temp => {
    const tempBtn = document.createElement("div");
    tempBtn.classList.add("temp-btn");
    tempBtn.textContent = temp === "hot" ? "🔥 Hot" : "🧊 Cold";
    tempBtn.dataset.temp = temp;
    tempBtn.addEventListener("click", () => selectTemp(temp));
    tempOptions.appendChild(tempBtn);
  });
}

// === SELECTION HANDLERS ===
function handleNameInputKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent new line in input
    currentName = internalNameInput.value.trim();
    if (currentName.length > 0) {
      playSound("selectSound");
      cupLabel.textContent = currentName; // Set name on cup
      updateMachineState("COFFEE_SELECTION");
    }
  }
}

function selectCoffee(index) {
  if (machineState !== "COFFEE_SELECTION") return;
  playSound("selectSound");
  selectedCoffeeIndex = index;
  document.querySelectorAll('.coffee-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelector(`.coffee-option[data-index="${index}"]`).classList.add('selected');
  updateMachineState("SIZE_SELECTION");
}

function selectSize(index) {
  if (machineState !== "SIZE_SELECTION") return;
  playSound("selectSound");
  selectedSizeIndex = index;
  document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.size-btn[data-index="${index}"]`).classList.add('selected');
  
  // Update cup size visually
  const size = sizes[selectedSizeIndex];
  gsap.to(cup, { width: size.width, height: size.height, duration: 0.6, ease: "power2.out" });
  gsap.to(cupLabel, { fontSize: size.width / 6 + 'px', duration: 0.6, ease: "power2.out" }); // Adjust label size
  
  // Also adjust pour canvas to match cup size
  pourCanvas.width = size.width;
  pourCanvas.height = size.height;
  gsap.to(pourCanvas, { width: size.width, height: size.height, duration: 0.6, ease: "power2.out" });

  updateMachineState("TEMP_SELECTION");
}

function selectTemp(temp) {
  if (machineState !== "TEMP_SELECTION") return;
  playSound("selectSound");
  selectedTemp = temp;
  document.querySelectorAll('.temp-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.temp-btn[data-temp="${temp}"]`).classList.add('selected');
  updateMachineState("READY_TO_BREW");
}

function startBrew() {
  if (machineState !== "READY_TO_BREW") return;
  playSound("selectSound"); // Sound for brew button click

  updateMachineState("BREWING");

  let timeLeft = 10;
  timerDisplay.textContent = timeLeft;

  const coffee = coffees[selectedCoffeeIndex];
  const isIced = (selectedTemp === "cold");
  
  // Play sounds
  playSound("clinkSound");
  if (!isIced) playSound("steamSound");

  const timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      completeBrew();
    }
  }, 1000);
}

function completeBrew() {
  const coffee = coffees[selectedCoffeeIndex];
  const isIced = (selectedTemp === "cold");
  const ctx = pourCanvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, pourCanvas.width, pourCanvas.height);

  // Draw pour with unique color
  const gradient = ctx.createLinearGradient(0, 0, 0, pourCanvas.height);
  gradient.addColorStop(0, coffee.color);
  gradient.addColorStop(1, coffee.color + "aa"); // semi-transparent
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, pourCanvas.width, pourCanvas.height);

  // Animate pour
  gsap.to(pourCanvas, { opacity: 1, duration: 0.8, ease: "power2.out", onStart: () => playSound("pourSound") });

  // Add drip effect / steam
  gsap.set([steamParticles, iceCube], { opacity: 0 }); // Reset first
  if (isIced) {
    createIceDrops();
    gsap.to(iceCube, { opacity: 1, duration: 0.6, ease: "power2.out" });
  } else {
    createSteamParticles(); // Regenerate steam particles
    gsap.to(steamParticles, { opacity: 1, duration: 0.6, ease: "power2.out" });
  }

  updateMachineState("SERVED");

  setTimeout(() => {
    updateMachineState("PAYMENT_READY");
  }, 2000); // Give time for coffee to settle
}

function handleKiss() {
  if (machineState !== "PAYMENT_READY") return;

  // Immediately disable interaction to prevent double-click issues
  body.classList.remove('kiss-cursor');
  kissHotspot.style.pointerEvents = 'none'; 
  
  gsap.to(blush, { opacity: 1, duration: 0.5, ease: "power2.out" });
  gsap.to(thankYou, { opacity: 1, duration: 1, delay: 0.5, ease: "power2.out" });
  setAiChatText(AI_PHRASES.KISS_RECEIVED, false); // No typewriter for short message
  
  increaseLove();
  launchConfetti();

  // Reset for next interaction
  setTimeout(() => {
    gsap.to([blush, thankYou, cup, cupLabel, pourCanvas, steamParticles, iceCube], { opacity: 0, duration: 0.5, ease: "power2.out" });
    // Reset selections for next round
    selectedCoffeeIndex = -1;
    selectedSizeIndex = -1;
    selectedTemp = "";
    updateMachineState("COFFEE_SELECTION"); // Back to selection for next coffee
  }, 3000);
}

// === ANIMATION & UTILITY FUNCTIONS ===
function createSteamParticles() {
  steamParticles.innerHTML = ''; // Clear previous particles
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("div");
    p.classList.add("steam-particle");
    p.style.left = `${Math.random() * 30}px`;
    p.style.top = `${Math.random() * 20}px`;
    p.style.animationDelay = `${Math.random() * 2}s`;
    p.style.opacity = Math.random() * 0.5 + 0.3;
    steamParticles.appendChild(p);
  }
}

function createIceDrops() {
  // Only clear existing ice drops, not the iceCube itself
  const existingDrops = iceCube.querySelectorAll('.ice-drop');
  existingDrops.forEach(drop => drop.remove());

  for (let i = 0; i < 5; i++) {
    const drop = document.createElement("div");
    drop.classList.add("ice-drop");
    drop.style.left = `${Math.random() * 40}px`; // Spread drops
    drop.style.top = `${Math.random() * 40}px`;
    drop.style.animationDelay = `${Math.random() * 0.5}s`;
    iceCube.appendChild(drop);
  }
  playSound("iceDropSound");
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
    
    // Position particles to fall from the top of the screen
    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.top = `-20px`; // Start above view

    // Add keyframe style dynamically to ensure unique animation for each particle
    const style = document.createElement("style");
    const animName = `fall-${Date.now()}-${i}`;
    style.textContent = `
      @keyframes ${animName} {
        to { transform: translate(${Math.random() * 200 - 100}px, ${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    particle.style.animation = `${animName} ${Math.random() * 3 + 2}s linear forwards`;
    confetti.appendChild(particle);
  }

  setTimeout(() => {
    confetti.remove();
  }, 5000);
}

function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) { // Check if audio element exists
    audio.currentTime = 0;
    audio.play().catch(e => console.log(`Audio play failed for ${id}:`, e));
  }
}

function increaseLove() {
  loveLevel += 10;
  if (loveLevel > 100) loveLevel = 100;
  loveFill.style.width = loveLevel + "%";

  let phrase = "";
  if (loveLevel >= 50 && loveLevel < 80) {
    phrase = AI_PHRASES.LOVE_LEVEL_50;
  } else if (loveLevel >= 80 && loveLevel < 100) {
    phrase = AI_PHRASES.LOVE_LEVEL_80;
  } else if (loveLevel >= 100) {
    phrase = AI_PHRASES.LOVE_LEVEL_100;
  }
  if (phrase) {
    setAiChatText(phrase, false); // No typewriter for love level updates
  }
}

// Initialize on window load
window.onload = init;