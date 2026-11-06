// Personalise these values before sharing the page.
const HER_NAME = "";
const LOVE_LETTER = "{name}, I've really enjoyed getting to know you. I admire your warmth, your curiosity and the way you make even ordinary moments feel a little brighter. Thank you for taking this little adventure with me.";
const ENVELOPE_MESSAGE = "I don't know exactly where this is going, but I know I'm enjoying every moment of getting to know you. I'm glad you're here.";
const WHATSAPP_PHONE = "254790283553"; // International format, digits only.
const RELATIONSHIP_YES_MESSAGE = "I was really hoping you'd say that. ❤️";
const RELATIONSHIP_NO_ATTEMPTS = [
  "Wait, what was that? 🥺",
  "I think you meant YES.",
  "Are we really doing this?",
  "Please reconsider your position.",
  "I've rehearsed this moment, you know.",
  "You're making me nervous now.",
  "This is becoming a difficult negotiation.",
  "I even made a whole website!",
  "My confidence is leaving the chat.",
  "Can I at least present my case?",
  "The YES button is right there, just saying.",
  "Okay, dramatic pause... reconsider?"
];

const STORAGE_KEY = "elsieRomanticJourney";
const giftOptions = ["flowers", "jewellery", "experience", "surprise"];
const flowerOptions = [
  "Red roses",
  "Pink roses",
  "White roses",
  "Tulips",
  "Lilies",
  "Sunflowers",
  "Peonies",
  "Orchids",
  "Baby's breath",
  "Mixed bouquets"
];
const roseVarietyOptions = ["Classic long-stem", "Garden roses", "Spray roses"];
const jewelleryOptions = ["Diamond necklace", "Diamond earrings", "Diamond bracelet", "Diamond ring"];
const metalOptions = ["Gold", "White gold", "Silver", "No preference"];
const jewelleryStyleOptions = ["Minimalist and delicate", "Statement pieces"];
const experienceOptions = ["A romantic dinner", "A weekend getaway", "An adventure", "A relaxing spa day"];
const shillongSongOptions = ["Location", "Better", "Talk", "Young Dumb & Broke"];
const shillongActivityOptions = ["Sightseeing", "Visit a café", "Take pictures", "Nice dinner"];
const dateOptions = ["Dinner somewhere beautiful", "An adventure", "A quiet evening together", "Surprise me"];
const happinessOptions = ["Quality time", "Thoughtful gifts", "Sweet words", "Little acts of kindness"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const progressSteps = [...document.querySelectorAll(".progress-step")];
const progressFill = document.getElementById("progressFill");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const musicStatus = document.getElementById("musicStatus");
const choiceCelebration = document.getElementById("choiceCelebration");
const destinationResult = document.getElementById("destinationResult");
const destinationMessage = document.getElementById("destinationMessage");
const dateResponsePanel = document.getElementById("dateResponse");
const dateResponseMessage = document.getElementById("dateResponseMessage");
const relationshipOutcome = document.getElementById("relationshipOutcome");
const relationshipOutcomeLabel = document.getElementById("relationshipOutcomeLabel");
const relationshipOutcomeMessage = document.getElementById("relationshipOutcomeMessage");
const finalActions = document.getElementById("finalActions");
const whatsappLink = document.getElementById("whatsappLink");
const whatsappNote = document.getElementById("whatsappNote");

const destinationMessages = {
  Bali: "Bali sounds lovely: golden-hour skies, quiet villa mornings and the chance to explore somewhere new together. ❤️",
  Maldives: "The Maldives has a certain magic: turquoise water, slow mornings and sunsets worth remembering. ❤️",
  Malaysia: "Malaysia would be such an adventure: island air, night markets and plenty of new things to discover. ❤️",
  Singapore: "Singapore sounds wonderful: garden paths, city lights and a great dinner at the end of the day. ❤️"
};

const missNoMessages = [
  "Nice try.",
  "Too slow! 😂",
  "Not today, love.",
  "You really thought? 🙄",
  "That button has places to be.",
  "I'm starting to feel attacked.",
  "The answer is obviously yes 😭",
  "You cannot catch me!",
  "This is getting embarrassing 😂"
];

let currentScreen = document.querySelector(".screen.is-active");
let transitionPromise = Promise.resolve();
let missAttempts = 0;
let selectedDestination = null;
let dateResponse = null;
let relationshipResponse = null;
let relationshipNoAttempts = 0;
let relationshipNoMessageIndex = 0;
let birthdayAnswers = {
  gifts: [],
  everything: false,
  flowers: [],
  roseVarieties: [],
  jewellery: [],
  metal: null,
  jewelleryStyle: null,
  experience: null,
  surpriseNote: ""
};
let shillongAnswers = {
  songs: [],
  activities: []
};
let miniGameAnswers = {
  idealDate: null,
  happiest: null,
  dayImprover: "",
  dayImproverSkipped: false
};
let storageMessage = "Your choices will be saved privately on this device.";
let musicContext = null;
let musicTimer = null;
let musicNoteIndex = 0;

function announce(message) {
  musicStatus.textContent = "";
  window.setTimeout(() => {
    musicStatus.textContent = message;
  }, 20);
}

function updateProgress(activeIndex) {
  progressSteps.forEach((step, index) => {
    step.classList.toggle("is-current", index === activeIndex);
    step.classList.toggle("is-complete", index < activeIndex);
    if (index === activeIndex) {
      step.setAttribute("aria-current", "step");
    } else {
      step.removeAttribute("aria-current");
    }
  });
  progressFill.style.width = `${(activeIndex / (progressSteps.length - 1)) * 86}%`;
}

function wait(duration) {
  return new Promise(resolve => window.setTimeout(resolve, duration));
}

async function showScreen(nextScreen, progressIndex) {
  transitionPromise = transitionPromise.then(async () => {
    if (nextScreen === currentScreen) return;
    const previousScreen = currentScreen;
    previousScreen.classList.add("is-leaving");

    await wait(reducedMotion.matches ? 0 : 210);
    previousScreen.hidden = true;
    previousScreen.classList.remove("is-active", "is-leaving");
    nextScreen.hidden = false;
    nextScreen.classList.add("is-active");
    nextScreen.setAttribute("aria-hidden", "false");
    previousScreen.setAttribute("aria-hidden", "true");
    currentScreen = nextScreen;
    updateProgress(progressIndex);

    const heading = nextScreen.querySelector("h1");
    if (heading) heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    await wait(reducedMotion.matches ? 0 : 220);
  });
  await transitionPromise;
}

function saveResponse(shouldAnnounce = true) {
  const response = {
    dateResponse,
    relationshipResponse,
    destination: selectedDestination,
    birthday: birthdayAnswers,
    shillong: shillongAnswers,
    miniGame: miniGameAnswers
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    storageMessage = "Your choices are saved privately on this device.";
    if (shouldAnnounce) announce(storageMessage);
    return true;
  } catch (error) {
    storageMessage = "This browser couldn't save your choices. The adventure still works, but they won't persist after you close it.";
    if (shouldAnnounce) announce(storageMessage);
    return false;
  }
}

function restoreResponse() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const response = JSON.parse(saved);
    if (response && ["yes", "more"].includes(response.dateResponse)) dateResponse = response.dateResponse;
    if (response && ["yes", "no", "time"].includes(response.relationshipResponse)) {
      relationshipResponse = response.relationshipResponse;
    }
    if (response && Object.prototype.hasOwnProperty.call(destinationMessages, response.destination)) {
      selectedDestination = response.destination;
    }
    if (response && response.birthday && typeof response.birthday === "object") {
      birthdayAnswers.gifts = Array.isArray(response.birthday.gifts)
        ? response.birthday.gifts.filter(gift => giftOptions.includes(gift))
        : [];
      birthdayAnswers.everything = response.birthday.everything === true;
      const savedFlowers = Array.isArray(response.birthday.flowers)
        ? response.birthday.flowers
        : response.birthday.flowers === "Roses"
          ? ["Red roses", "Pink roses", "White roses"]
          : [response.birthday.flowers];
      birthdayAnswers.flowers = savedFlowers.filter(flower => flowerOptions.includes(flower));
      birthdayAnswers.roseVarieties = Array.isArray(response.birthday.roseVarieties)
        ? response.birthday.roseVarieties.filter(variety => roseVarietyOptions.includes(variety))
        : [];
      const savedJewellery = Array.isArray(response.birthday.jewellery)
        ? response.birthday.jewellery
        : [response.birthday.jewellery === "A ring" ? "Diamond ring" : response.birthday.jewellery];
      birthdayAnswers.jewellery = savedJewellery.filter(item => jewelleryOptions.includes(item));
      birthdayAnswers.metal = metalOptions.includes(response.birthday.metal) ? response.birthday.metal : null;
      birthdayAnswers.jewelleryStyle = jewelleryStyleOptions.includes(response.birthday.jewelleryStyle)
        ? response.birthday.jewelleryStyle
        : null;
      birthdayAnswers.experience = experienceOptions.includes(response.birthday.experience) ? response.birthday.experience : null;
      birthdayAnswers.surpriseNote = typeof response.birthday.surpriseNote === "string"
        ? response.birthday.surpriseNote.slice(0, 240)
        : "";
    }
    if (response && response.shillong && typeof response.shillong === "object") {
      shillongAnswers.songs = Array.isArray(response.shillong.songs)
        ? response.shillong.songs.filter(song => shillongSongOptions.includes(song))
        : [];
      shillongAnswers.activities = Array.isArray(response.shillong.activities)
        ? response.shillong.activities.filter(activity => shillongActivityOptions.includes(activity))
        : [];
    }
    if (response && response.miniGame && typeof response.miniGame === "object") {
      miniGameAnswers.idealDate = dateOptions.includes(response.miniGame.idealDate) ? response.miniGame.idealDate : null;
      miniGameAnswers.happiest = happinessOptions.includes(response.miniGame.happiest) ? response.miniGame.happiest : null;
      miniGameAnswers.dayImprover = typeof response.miniGame.dayImprover === "string"
        ? response.miniGame.dayImprover.slice(0, 200)
        : "";
      miniGameAnswers.dayImproverSkipped = response.miniGame.dayImproverSkipped === true;
    }
    if (dateResponse || relationshipResponse || selectedDestination ||
        birthdayAnswers.gifts.length || miniGameAnswers.idealDate || miniGameAnswers.happiest) {
      storageMessage = "Your previously saved choices are ready on this device.";
    }
  } catch (error) {
    storageMessage = "A previous response couldn't be read, but you can still enjoy the adventure.";
    announce(storageMessage);
  }
}

function playChoiceHearts(amount = 12) {
  if (reducedMotion.matches) return;
  const symbols = ["♥", "♡", "♥", "✦"];

  for (let index = 0; index < amount; index++) {
    const particle = document.createElement("span");
    particle.className = "floating-particle";
    particle.setAttribute("aria-hidden", "true");
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.left = `${8 + Math.random() * 84}vw`;
    particle.style.top = `${48 + Math.random() * 38}vh`;
    particle.style.color = index % 3 === 0 ? "var(--dark-pink)" : "var(--pink)";
    particle.style.fontSize = `${14 + Math.random() * 20}px`;
    particle.style.animationDelay = `${Math.random() * 0.45}s`;
    choiceCelebration.append(particle);
    window.setTimeout(() => particle.remove(), 3100);
  }
}

function playRelationshipConfetti() {
  if (reducedMotion.matches) return;
  const colors = ["#b85e82", "#d98da8", "#c5a36d", "#fff3f6", "#42283d"];

  for (let index = 0; index < 42; index++) {
    const piece = document.createElement("span");
    piece.className = "confetti-particle";
    piece.setAttribute("aria-hidden", "true");
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-drift", `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.5}s`;
    choiceCelebration.append(piece);
    window.setTimeout(() => piece.remove(), 4500);
  }
}

function moveNoButton(button, zone, affirmativeButton, messages, attempt) {
  const message = messages[Math.min(attempt, messages.length - 1)];
  button.textContent = message;

  const zoneWidth = zone.clientWidth;
  const zoneHeight = zone.clientHeight;
  const buttonWidth = button.offsetWidth;
  const buttonHeight = button.offsetHeight;
  const maxX = Math.max(0, zoneWidth - buttonWidth);
  const maxY = Math.max(0, zoneHeight - buttonHeight);
  const zoneRect = zone.getBoundingClientRect();
  const yesRect = affirmativeButton.getBoundingClientRect();
  const yesLeft = yesRect.left - zoneRect.left;
  const yesTop = yesRect.top - zoneRect.top;
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const minY = isMobile ? Math.min(maxY, Math.ceil(zoneHeight * 0.48)) : 8;
  const availableY = Math.max(0, maxY - minY);
  let position = { x: 0, y: minY };

  for (let index = 0; index < 40; index++) {
    const candidate = {
      x: Math.random() * maxX,
      y: minY + Math.random() * availableY
    };
    const overlapsYes =
      candidate.x < yesLeft + yesRect.width + 10 &&
      candidate.x + buttonWidth > yesLeft - 10 &&
      candidate.y < yesTop + yesRect.height + 10 &&
      candidate.y + buttonHeight > yesTop - 10;

    position = candidate;
    if (!overlapsYes) break;
  }

  const overlapsAffirmative =
    position.x < yesLeft + yesRect.width + 10 &&
    position.x + buttonWidth > yesLeft - 10 &&
    position.y < yesTop + yesRect.height + 10 &&
    position.y + buttonHeight > yesTop - 10;

  if (overlapsAffirmative) {
    const safeRight = yesLeft + yesRect.width + 12;
    const safeBelow = yesTop + yesRect.height + 12;
    const safeLeft = yesLeft - buttonWidth - 12;
    if (safeRight + buttonWidth <= zoneWidth) {
      position = { x: safeRight, y: Math.min(maxY, Math.max(minY, position.y)) };
    } else if (safeBelow + buttonHeight <= zoneHeight) {
      position = { x: Math.min(maxX, Math.max(0, position.x)), y: safeBelow };
    } else if (safeLeft >= 0) {
      position = { x: safeLeft, y: Math.min(maxY, Math.max(minY, position.y)) };
    }
  }

  button.style.transition = "none";
  button.style.transform = "none";
  button.style.left = `${position.x}px`;
  button.style.top = `${position.y}px`;
  button.offsetWidth;
  button.style.removeProperty("transition");
}

function attachDodgingButton(button, zone, affirmativeButton, messages, incrementAttempts, hint, onAttempt) {
  function dodge() {
    const attempt = incrementAttempts();
    moveNoButton(button, zone, affirmativeButton, messages, attempt);
    hint.textContent = attempt === 2
      ? "Why are you fighting this? 😂"
      : attempt === 5
        ? "The NO button is clearly not cooperating."
        : attempt >= 8
          ? "I think we both know the answer. ❤️"
          : "Choose wisely. I'm emotionally invested.";
    if (onAttempt) onAttempt(attempt);
  }

  button.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") dodge();
  });

  button.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch") {
      event.preventDefault();
      dodge();
    }
  });

  button.addEventListener("click", event => {
    event.preventDefault();
    dodge();
  });

  window.addEventListener("resize", () => {
    if (button.style.left || button.style.top) {
      button.style.removeProperty("left");
      button.style.removeProperty("top");
      button.style.removeProperty("transform");
    }
  });

}

attachDodgingButton(
  document.getElementById("missNo"),
  document.getElementById("missButtonZone"),
  document.getElementById("missYes"),
  missNoMessages,
  () => missAttempts++,
  document.getElementById("missHint")
);

function showDateResponse(answer, celebrate = true) {
  dateResponse = answer;
  dateResponseMessage.textContent = answer === "yes"
    ? "Well, that's one date I can't wait to plan."
    : "Good food, great company and hopefully a few unforgettable memories. What do you say?";
  dateResponsePanel.hidden = false;
  document.getElementById("dateYes").setAttribute("aria-pressed", String(answer === "yes"));
  document.getElementById("tellMeMore").setAttribute("aria-pressed", String(answer === "more"));
  saveResponse();
  if (celebrate) playChoiceHearts(8);
}

function showRelationshipOutcome(answer, celebrate = true) {
  relationshipResponse = answer;
  relationshipOutcomeLabel.textContent = answer === "yes"
    ? "A lovely new beginning"
    : answer === "no"
      ? "A dramatic plot twist"
      : "No rush";
  relationshipOutcomeMessage.textContent = answer === "yes"
    ? RELATIONSHIP_YES_MESSAGE
    : answer === "no"
      ? "Well... that wasn't in my plans."
      : "That's okay. Take your time. I'd rather have an honest answer than a rushed one.";
  relationshipOutcome.hidden = false;
  document.getElementById("officialYes").setAttribute("aria-pressed", String(answer === "yes"));
  document.getElementById("officialNo").setAttribute("aria-pressed", String(answer === "no"));
  document.getElementById("officialTime").setAttribute("aria-pressed", String(answer === "time"));
  saveResponse();
  if (celebrate && answer === "yes") {
    relationshipOutcome.classList.remove("is-no-outcome");
    relationshipOutcome.classList.add("is-yes-outcome");
    playChoiceHearts(20);
    playRelationshipConfetti();
  } else if (answer === "no") {
    relationshipOutcome.classList.remove("is-yes-outcome");
    relationshipOutcome.classList.add("is-no-outcome");
  } else {
    relationshipOutcome.classList.remove("is-yes-outcome", "is-no-outcome");
  }
}

["dateYes", "tellMeMore", "officialYes", "officialNo", "officialTime"].forEach(id => {
  document.getElementById(id).setAttribute("aria-pressed", "false");
});

document.getElementById("missYes").addEventListener("click", async () => {
  playChoiceHearts(8);
  if (dateResponse) showDateResponse(dateResponse, false);
  await showScreen(document.getElementById("date"), 1);
});

document.getElementById("dateYes").addEventListener("click", () => {
  showDateResponse("yes");
});

document.getElementById("tellMeMore").addEventListener("click", () => {
  showDateResponse("more", false);
});

document.getElementById("continueToRelationship").addEventListener("click", async () => {
  if (relationshipResponse) showRelationshipOutcome(relationshipResponse, false);
  await showScreen(document.getElementById("relationship"), 2);
});

document.getElementById("officialYes").addEventListener("click", () => {
  resetRelationshipNoButton();
  showRelationshipOutcome("yes");
  window.setTimeout(() => {
    if (currentScreen === document.getElementById("relationship")) {
      document.getElementById("continueToGetaway").click();
    }
  }, 1800);
});

document.getElementById("officialTime").addEventListener("click", () => {
  resetRelationshipNoButton();
  showRelationshipOutcome("time", false);
});

function resetRelationshipNoButton() {
  relationshipNoAttempts = 0;
  relationshipNoMessageIndex = 0;
  const noButton = document.getElementById("officialNo");
  const yesButton = document.getElementById("officialYes");
  noButton.style.removeProperty("left");
  noButton.style.removeProperty("top");
  noButton.style.removeProperty("transform");
  noButton.style.removeProperty("--no-scale");
  noButton.textContent = "NO";
  yesButton.style.removeProperty("--yes-scale");
  const messageBubble = document.getElementById("officialNoHint");
  messageBubble.hidden = true;
  messageBubble.classList.remove("is-visible");
  messageBubble.textContent = "";
}

attachDodgingButton(
  document.getElementById("officialNo"),
  document.getElementById("relationshipButtonZone"),
  document.getElementById("officialYes"),
  ["NO"],
  () => {
    const attempt = relationshipNoAttempts++;
    document.getElementById("officialNo").style.setProperty(
      "--no-scale",
      String(Math.max(0.68, 1 - relationshipNoAttempts * 0.045))
    );
    document.getElementById("officialYes").style.setProperty(
      "--yes-scale",
      String(1 + Math.min(relationshipNoAttempts, 7) * 0.025)
    );
    return attempt;
  },
  document.getElementById("officialNoHint"),
  () => {
    const message = RELATIONSHIP_NO_ATTEMPTS[relationshipNoMessageIndex];
    relationshipNoMessageIndex = (relationshipNoMessageIndex + 1) % RELATIONSHIP_NO_ATTEMPTS.length;
    const bubble = document.getElementById("officialNoHint");
    bubble.textContent = message;
    bubble.hidden = false;
    bubble.classList.remove("is-visible");
    bubble.offsetWidth;
    bubble.classList.add("is-visible");
  }
);

document.getElementById("continueToGetaway").addEventListener("click", async () => {
  await showScreen(document.getElementById("getaway"), 3);
  if (selectedDestination) showDestinationChoice(selectedDestination, false);
});

function showDestinationChoice(destination, shouldCelebrate = true) {
  selectedDestination = destination;
  document.querySelectorAll(".destination-card").forEach(card => {
    const selected = card.querySelector("[data-destination]").dataset.destination === destination;
    card.classList.toggle("is-selected", selected);
    const button = card.querySelector(".destination-button");
    button.setAttribute("aria-pressed", String(selected));
  });

  destinationMessage.textContent = destinationMessages[destination];
  destinationResult.hidden = false;
  saveResponse();
  if (shouldCelebrate) playChoiceHearts(6);
}

document.querySelectorAll("[data-destination]").forEach(button => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    showDestinationChoice(button.dataset.destination);
    destinationResult.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "nearest"
    });
  });
});

document.getElementById("toFinal").addEventListener("click", async () => {
  renderShillongAnswers();
  await showScreen(document.getElementById("shillong"), 4);
});

function updateShillongCountdown() {
  const target = new Date(2026, 10, 21, 0, 0, 0, 0);
  const remaining = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  document.getElementById("shillongCountdownDays").textContent = String(days).padStart(3, "0");
  document.getElementById("shillongCountdownHours").textContent = String(hours).padStart(2, "0");
  document.getElementById("shillongCountdownMinutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("shillongCountdownSeconds").textContent = String(seconds).padStart(2, "0");
  document.getElementById("shillongCountdown").setAttribute(
    "aria-label",
    remaining ? "Time until 21 November 2026" : "21 November 2026 has arrived"
  );
}

function renderShillongAnswers() {
  document.querySelectorAll("[data-shillong-song]").forEach(button => {
    const selected = shillongAnswers.songs.includes(button.dataset.shillongSong);
    button.setAttribute("aria-pressed", String(selected));
    button.querySelector(".song-mark").textContent = selected ? "✓" : "＋";
  });
  document.querySelectorAll("[data-shillong-activity]").forEach(button => {
    button.setAttribute("aria-pressed", String(shillongAnswers.activities.includes(button.dataset.shillongActivity)));
  });
}

function saveShillongAnswers() {
  const saved = saveResponse(false);
  document.getElementById("shillongSaveStatus").textContent = saved
    ? "Your ideas are saved on this device."
    : storageMessage;
}

function toggleShillongChoice(list, choice) {
  shillongAnswers[list] = shillongAnswers[list].includes(choice)
    ? shillongAnswers[list].filter(selected => selected !== choice)
    : [...shillongAnswers[list], choice];
  renderShillongAnswers();
  saveShillongAnswers();
}

document.querySelectorAll("[data-shillong-song]").forEach(button => {
  button.addEventListener("click", () => toggleShillongChoice("songs", button.dataset.shillongSong));
});

document.querySelectorAll("[data-shillong-activity]").forEach(button => {
  button.addEventListener("click", () => toggleShillongChoice("activities", button.dataset.shillongActivity));
});

document.getElementById("continueToBirthday").addEventListener("click", async () => {
  await showScreen(document.getElementById("birthday"), 5);
});

function updateBirthdayCountdown() {
  const target = new Date(2027, 0, 17, 0, 0, 0, 0);
  const remaining = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  document.getElementById("countdownDays").textContent = String(days).padStart(3, "0");
  document.getElementById("countdownHours").textContent = String(hours).padStart(2, "0");
  document.getElementById("countdownMinutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("countdownSeconds").textContent = String(seconds).padStart(2, "0");
  document.getElementById("birthdayCountdown").setAttribute(
    "aria-label",
    remaining ? "Time until 17 January 2027" : "17 January 2027 has arrived"
  );
}

function renderBirthdayAnswers() {
  document.querySelectorAll("[data-gift]").forEach(button => {
    const gift = button.dataset.gift;
    const selected = gift === "everything"
      ? birthdayAnswers.everything
      : birthdayAnswers.gifts.includes(gift);
    button.setAttribute("aria-pressed", String(selected));
  });

  document.getElementById("flowerFollowup").hidden = !birthdayAnswers.gifts.includes("flowers");
  document.getElementById("jewelleryFollowup").hidden = !birthdayAnswers.gifts.includes("jewellery");
  document.getElementById("experienceFollowup").hidden = !birthdayAnswers.gifts.includes("experience");
  document.getElementById("surpriseFollowup").hidden = !birthdayAnswers.gifts.includes("surprise");
  document.querySelectorAll("[data-gallery-group]").forEach(button => {
    const group = button.dataset.galleryGroup;
    const selected = group === "flowers" || group === "jewellery" || group === "roseVarieties"
      ? birthdayAnswers[group].includes(button.dataset.galleryChoice)
      : birthdayAnswers[group] === button.dataset.galleryChoice;
    button.setAttribute("aria-pressed", String(selected));
  });
  document.getElementById("roseVarieties").hidden =
    !birthdayAnswers.flowers.some(flower => ["Red roses", "Pink roses", "White roses"].includes(flower));
  document.getElementById("surpriseNote").value = birthdayAnswers.surpriseNote;
  document.querySelectorAll("[data-answer-group]").forEach(button => {
    button.setAttribute("aria-pressed", String(birthdayAnswers[button.dataset.answerGroup] === button.dataset.answer));
  });
  document.getElementById("continueToGame").disabled = birthdayAnswers.gifts.length === 0;
}

function renderMiniGameAnswers() {
  document.querySelectorAll(".quiz-question[data-quiz]").forEach(question => {
    const answer = miniGameAnswers[question.dataset.quiz];
    question.querySelectorAll("[data-answer]").forEach(button => {
      button.setAttribute("aria-pressed", String(answer === button.dataset.answer));
    });
  });
  document.getElementById("dayImprover").value = miniGameAnswers.dayImprover;
  document.getElementById("skipDayImprover").setAttribute("aria-pressed", String(miniGameAnswers.dayImproverSkipped));
  const isComplete = Boolean(miniGameAnswers.idealDate && miniGameAnswers.happiest &&
    (miniGameAnswers.dayImproverSkipped || miniGameAnswers.dayImprover.trim()));
  document.getElementById("quizComplete").hidden = !isComplete;
}

function clearBirthdayDetails(gift) {
  if (gift === "flowers" || gift === "everything") {
    birthdayAnswers.flowers = [];
    birthdayAnswers.roseVarieties = [];
  }
  if (gift === "jewellery" || gift === "everything") {
    birthdayAnswers.jewellery = [];
    birthdayAnswers.metal = null;
    birthdayAnswers.jewelleryStyle = null;
  }
  if (gift === "experience" || gift === "everything") birthdayAnswers.experience = null;
  if (gift === "surprise" || gift === "everything") birthdayAnswers.surpriseNote = "";
}

function saveFormAnswers() {
  const saved = saveResponse(false);
  const message = saved
    ? "Your answers are saved privately on this device."
    : storageMessage;
  document.getElementById("birthdaySaveNote").textContent = message;
  document.getElementById("quizSaveNote").textContent = message;
}

document.querySelectorAll("[data-gift]").forEach(button => {
  button.addEventListener("click", () => {
    const gift = button.dataset.gift;
    if (gift === "everything") {
      birthdayAnswers.everything = !birthdayAnswers.everything;
      birthdayAnswers.gifts = birthdayAnswers.everything ? [...giftOptions] : [];
      if (!birthdayAnswers.everything) clearBirthdayDetails("everything");
    } else {
      const wasSelected = birthdayAnswers.gifts.includes(gift);
      birthdayAnswers.everything = false;
      birthdayAnswers.gifts = wasSelected
        ? birthdayAnswers.gifts.filter(selectedGift => selectedGift !== gift)
        : [...birthdayAnswers.gifts, gift];
      if (wasSelected) clearBirthdayDetails(gift);
    }
    renderBirthdayAnswers();
    saveFormAnswers();
    if (birthdayAnswers.gifts.includes(gift) || gift === "everything") playChoiceHearts(3);
  });
});

document.querySelectorAll("[data-answer-group]").forEach(button => {
  button.addEventListener("click", () => {
    birthdayAnswers[button.dataset.answerGroup] = button.dataset.answer;
    renderBirthdayAnswers();
    saveFormAnswers();
  });
});

document.querySelectorAll("[data-gallery-group]").forEach(button => {
  button.addEventListener("click", () => {
    const group = button.dataset.galleryGroup;
    const choice = button.dataset.galleryChoice;
    const currentChoices = birthdayAnswers[group];
    birthdayAnswers[group] = currentChoices.includes(choice)
      ? currentChoices.filter(selected => selected !== choice)
      : [...currentChoices, choice];
    renderBirthdayAnswers();
    saveFormAnswers();
  });
});

document.getElementById("surpriseNote").addEventListener("input", event => {
  birthdayAnswers.surpriseNote = event.currentTarget.value.slice(0, 240);
  saveFormAnswers();
});

document.querySelectorAll(".quiz-question[data-quiz] [data-answer]").forEach(button => {
  button.addEventListener("click", () => {
    miniGameAnswers[button.closest(".quiz-question").dataset.quiz] = button.dataset.answer;
    renderMiniGameAnswers();
    saveFormAnswers();
  });
});

document.getElementById("dayImprover").addEventListener("input", event => {
  miniGameAnswers.dayImprover = event.currentTarget.value.slice(0, 200);
  if (miniGameAnswers.dayImprover.trim()) miniGameAnswers.dayImproverSkipped = false;
  renderMiniGameAnswers();
  saveFormAnswers();
});

document.getElementById("skipDayImprover").addEventListener("click", () => {
  miniGameAnswers.dayImproverSkipped = true;
  renderMiniGameAnswers();
  saveFormAnswers();
});

document.getElementById("continueToGame").addEventListener("click", async () => {
  if (!birthdayAnswers.gifts.length) return;
  await showScreen(document.getElementById("miniGame"), 6);
});

document.getElementById("skipBirthdayQuestions").addEventListener("click", async () => {
  await showScreen(document.getElementById("miniGame"), 6);
});

document.getElementById("continueToEnvelope").addEventListener("click", async () => {
  await showScreen(document.getElementById("envelope"), 7);
});

document.getElementById("openEnvelope").addEventListener("click", event => {
  const button = event.currentTarget;
  if (button.getAttribute("aria-expanded") === "true") return;
  button.setAttribute("aria-expanded", "true");
  button.classList.add("is-open");
  document.getElementById("envelopeMessage").textContent = ENVELOPE_MESSAGE;
  document.getElementById("envelopeLetter").hidden = false;
  document.getElementById("continueToFinal").hidden = false;
  playChoiceHearts(5);
});

document.getElementById("continueToFinal").addEventListener("click", async () => {
  await showScreen(document.getElementById("final"), 8);
  configureFinalActions();
});

function renderBirthdaySummary() {
  const summary = document.getElementById("birthdaySummaryText");
  const parts = [];

  if (birthdayAnswers.gifts.length) {
    parts.push(`Birthday ideas: ${birthdayAnswers.gifts.join(", ")}`);
  }
  if (birthdayAnswers.flowers.length) {
    parts.push(`Flowers: ${birthdayAnswers.flowers.join(", ")}`);
  }
  if (birthdayAnswers.roseVarieties.length) {
    parts.push(`Rose styles: ${birthdayAnswers.roseVarieties.join(", ")}`);
  }
  if (birthdayAnswers.jewellery.length) {
    parts.push(`Jewellery: ${birthdayAnswers.jewellery.join(", ")}`);
  }
  if (birthdayAnswers.metal) parts.push(`Metal: ${birthdayAnswers.metal}`);
  if (birthdayAnswers.jewelleryStyle) parts.push(`Jewellery style: ${birthdayAnswers.jewelleryStyle}`);
  if (birthdayAnswers.experience) parts.push(`Birthday experience: ${birthdayAnswers.experience}`);
  if (birthdayAnswers.surpriseNote.trim()) parts.push(`A thoughtful-surprise clue: “${birthdayAnswers.surpriseNote.trim()}”`);

  summary.textContent = parts.length
    ? `${parts.join(". ")}. Just inspiration—nothing here is a commitment.`
    : "No birthday preferences selected yet. You can keep it that way or add a few ideas.";
}

function renderShillongSummary() {
  const summary = document.getElementById("shillongSummaryText");
  const parts = [];
  if (shillongAnswers.activities.length) {
    parts.push(`Ideas for the day: ${shillongAnswers.activities.join(", ")}`);
  }
  if (shillongAnswers.songs.length) {
    parts.push(`Khalid favourites: ${shillongAnswers.songs.join(", ")}`);
  }
  summary.textContent = parts.length
    ? `${parts.join(". ")}. Just a daydream for now—no plans are set.`
    : "No plans or songs picked yet. We can decide together, or leave the day open.";
}

document.getElementById("changeBirthdayPreferences").addEventListener("click", async () => {
  renderBirthdayAnswers();
  await showScreen(document.getElementById("birthday"), 5);
});

document.getElementById("editShillongSelections").addEventListener("click", async () => {
  renderShillongAnswers();
  await showScreen(document.getElementById("shillong"), 4);
});

function configureFinalActions() {
  renderBirthdaySummary();
  renderShillongSummary();
  const phone = WHATSAPP_PHONE.replace(/\D/g, "");
  if (/^\d{8,15}$/.test(phone)) {
    const dateAnswer = dateResponse === "yes"
      ? "said yes to a date"
      : dateResponse === "more"
        ? "asked to hear more about the date"
        : "date not answered";
    const relationshipAnswer = relationshipResponse === "yes"
      ? "said yes to making it official"
      : relationshipResponse === "no"
        ? "said no"
      : relationshipResponse === "time"
        ? "would like some time"
        : "relationship question not answered";
    const gifts = birthdayAnswers.gifts.length
      ? birthdayAnswers.gifts.map(gift => gift === "jewellery" ? "diamond jewellery" : gift).join(", ")
      : "birthday preferences skipped";
    const details = [
      shillongAnswers.activities.length && `Shillong day ideas: ${shillongAnswers.activities.join(", ")}`,
      shillongAnswers.songs.length && `Khalid favourites: ${shillongAnswers.songs.join(", ")}`,
      birthdayAnswers.flowers.length && `flowers: ${birthdayAnswers.flowers.join(", ")}`,
      birthdayAnswers.roseVarieties.length && `rose styles: ${birthdayAnswers.roseVarieties.join(", ")}`,
      birthdayAnswers.jewellery.length && `jewellery: ${birthdayAnswers.jewellery.join(", ")}`,
      birthdayAnswers.metal && `metal: ${birthdayAnswers.metal}`,
      birthdayAnswers.jewelleryStyle && `jewellery style: ${birthdayAnswers.jewelleryStyle}`,
      birthdayAnswers.experience && `birthday experience: ${birthdayAnswers.experience}`,
      birthdayAnswers.surpriseNote.trim() && `surprise clue: ${birthdayAnswers.surpriseNote.trim()}`,
      miniGameAnswers.idealDate && `ideal date: ${miniGameAnswers.idealDate}`,
      miniGameAnswers.happiest && `happiness: ${miniGameAnswers.happiest}`
    ].filter(Boolean).join("; ");
    const message = `My answers: ${dateAnswer}; ${relationshipAnswer}; dream getaway: ${selectedDestination || "not chosen"}; birthday ideas: ${gifts}${details ? `; ${details}` : ""}. ❤️`;
    whatsappLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    whatsappLink.hidden = false;
    whatsappNote.hidden = true;
  } else {
    whatsappLink.hidden = true;
    whatsappNote.hidden = false;
  }
}

document.getElementById("revealLetter").addEventListener("click", event => {
  const personalMessage = LOVE_LETTER.replace("{name}", HER_NAME.trim()).replace(/^,\s*/, "");
  document.getElementById("loveLetter").textContent = personalMessage;
  document.getElementById("letterReveal").hidden = false;
  finalActions.hidden = false;
  event.currentTarget.hidden = true;
  playChoiceHearts(10);
  document.getElementById("loveLetter").focus({ preventScroll: true });
});

async function restartExperience() {
  await transitionPromise;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    storageMessage = "Your choices have been cleared from this device.";
  } catch (error) {
    storageMessage = "Your browser couldn't clear the saved choices. You can still restart the adventure.";
  }

  resetAnswerState();
  missAttempts = 0;
  document.getElementById("missHint").textContent = "Choose wisely. I'm only a little emotionally invested.";
  document.getElementById("letterReveal").hidden = true;
  document.getElementById("loveLetter").textContent = "";
  document.getElementById("revealLetter").hidden = false;
  document.getElementById("openEnvelope").setAttribute("aria-expanded", "false");
  document.getElementById("openEnvelope").classList.remove("is-open");
  document.getElementById("envelopeLetter").hidden = true;
  document.getElementById("envelopeMessage").textContent = "";
  document.getElementById("continueToFinal").hidden = true;
  resetRelationshipNoButton();
  document.getElementById("relationshipOutcome").classList.remove("is-yes-outcome", "is-no-outcome");
  finalActions.hidden = true;
  document.querySelectorAll(".no-button").forEach(button => {
    button.style.removeProperty("left");
    button.style.removeProperty("top");
    button.style.removeProperty("transform");
    button.textContent = "No";
  });
  document.title = "A Little Adventure";
  await showScreen(document.getElementById("start"), 0);
  announce(storageMessage);
}

function resetAnswerState() {
  selectedDestination = null;
  dateResponse = null;
  relationshipResponse = null;
  resetRelationshipNoButton();
  shillongAnswers = {
    songs: [],
    activities: []
  };
  birthdayAnswers = {
    gifts: [],
    everything: false,
    flowers: [],
    roseVarieties: [],
    jewellery: [],
    metal: null,
    jewelleryStyle: null,
    experience: null,
    surpriseNote: ""
  };
  miniGameAnswers = {
    idealDate: null,
    happiest: null,
    dayImprover: "",
    dayImproverSkipped: false
  };
  dateResponsePanel.hidden = true;
  relationshipOutcome.hidden = true;
  relationshipOutcome.classList.remove("is-yes-outcome", "is-no-outcome");
  ["dateYes", "tellMeMore", "officialYes", "officialNo", "officialTime"].forEach(id => {
    document.getElementById(id).setAttribute("aria-pressed", "false");
  });
  destinationResult.hidden = true;
  destinationMessage.textContent = "";
  document.querySelectorAll(".destination-card").forEach(card => {
    card.classList.remove("is-selected");
    card.querySelector(".destination-button").setAttribute("aria-pressed", "false");
  });
  renderBirthdayAnswers();
  renderShillongAnswers();
  renderMiniGameAnswers();
}

document.getElementById("restartButton").addEventListener("click", restartExperience);
document.getElementById("homeLink").addEventListener("click", event => {
  event.preventDefault();
  restartExperience();
});

const nameGreeting = document.getElementById("nameGreeting");
nameGreeting.textContent = HER_NAME.trim()
  ? `FOR ${HER_NAME.trim().toLocaleUpperCase()}`
  : "JUST FOR YOU";

const ambientNotes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];

function playAmbientNote() {
  if (!musicContext || musicContext.state !== "running") return;
  const now = musicContext.currentTime;
  const oscillator = musicContext.createOscillator();
  const volume = musicContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = ambientNotes[musicNoteIndex % ambientNotes.length];
  musicNoteIndex++;
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.012, now + 0.28);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
  oscillator.connect(volume);
  volume.connect(musicContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 2.25);
}

async function toggleMusic() {
  if (musicContext) {
    window.clearInterval(musicTimer);
    musicTimer = null;
    const context = musicContext;
    musicContext = null;
    try {
      await context.close();
    } catch (error) {
      announce("The music couldn't be paused cleanly. You can keep enjoying the adventure.");
    }
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Play soft music";
    announce("Soft music paused.");
    return;
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    announce("Soft music isn't supported by this browser. The rest of the adventure still works.");
    return;
  }

  try {
    musicContext = new AudioContextConstructor();
    await musicContext.resume();
    playAmbientNote();
    musicTimer = window.setInterval(playAmbientNote, 1550);
    musicToggle.setAttribute("aria-pressed", "true");
    musicLabel.textContent = "Pause soft music";
    announce("Soft music is playing.");
  } catch (error) {
    if (musicContext) {
      try {
        await musicContext.close();
      } catch (closeError) {
        announce("The browser couldn't start or close the soft music. You can continue without it.");
      }
      musicContext = null;
    }
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Play soft music";
    announce("Soft music couldn't start in this browser. You can continue without it.");
  }
}

musicToggle.addEventListener("click", toggleMusic);

document.querySelectorAll(".destination-photo img, .gallery-photo img, .shillong-hero-image, .shillong-concert-inset img").forEach(image => {
  const setImageFallback = () => {
    image.hidden = true;
    image.parentElement.classList.add("image-fallback");
  };
  image.addEventListener("error", setImageFallback, { once: true });
  if (image.complete && !image.naturalWidth) setImageFallback();
});

function createBackgroundHeart() {
  const container = document.getElementById("backgroundHearts");
  if (reducedMotion.matches || container.childElementCount >= 4) return;
  const heart = document.createElement("span");
  heart.className = "background-heart";
  heart.setAttribute("aria-hidden", "true");
  heart.textContent = "♥";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 16}px`;
  heart.style.animationDuration = `${12 + Math.random() * 7}s`;
  container.append(heart);
  window.setTimeout(() => heart.remove(), 20000);
}

restoreResponse();
renderBirthdayAnswers();
renderShillongAnswers();
renderMiniGameAnswers();
updateProgress(0);
updateBirthdayCountdown();
updateShillongCountdown();
window.setInterval(updateBirthdayCountdown, 1000);
window.setInterval(updateShillongCountdown, 1000);
if (!reducedMotion.matches) {
  createBackgroundHeart();
  window.setInterval(createBackgroundHeart, 4500);
}
