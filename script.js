/* =================================
   1. TRACK MOUSE FOR LARGE FLASHLIGHT
================================= */

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
const illuminableCards = document.querySelectorAll(".illuminable");

document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.documentElement.style.setProperty("--mouse-x", `${mouseX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${mouseY}px`);

    // Highlight creature cards when the wide flashlight beam sweeps over them
    illuminableCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        const dist = Math.hypot(mouseX - cardCenterX, mouseY - cardCenterY);

        if (dist < 320) {
            card.classList.add("lit");
        } else {
            card.classList.remove("lit");
        }
    });
});


/* =================================
   2. CONTINUOUS PROGRESSIVE DARKNESS,
      CAMERA MOTION & PARALLAX
================================= */

const railFill = document.getElementById("railFill");
const railIndicator = document.getElementById("railIndicator");
const navDepthReadout = document.getElementById("navDepthReadout");
const parallaxLayers = document.querySelectorAll(".parallax-bg");
const panelInners = document.querySelectorAll(".panel-inner");

// Smooth color interpolation from sunlit teal to abyssal black
function interpolateWaterColor(progress) {
    // Start RGB: (10, 74, 108) -> End RGB: (1, 4, 10)
    const r = Math.round(10 * (1 - progress) + 1 * progress);
    const g = Math.round(74 * (1 - progress) + 4 * progress);
    const b = Math.round(108 * (1 - progress) + 10 * progress);
    return `rgb(${r}, ${g}, ${b})`;
}

function getZoneName(depth) {
    if (depth <= 200) return "SUNLIGHT";
    if (depth <= 1000) return "TWILIGHT";
    if (depth <= 4000) return "MIDNIGHT";
    if (depth <= 6000) return "ABYSS";
    return "HADAL";
}

let scrollVelocity = 0;
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    scrollVelocity = scrollY - lastScrollY;
    lastScrollY = scrollY;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    // Update depth numbers
    const currentDepth = Math.round(progress * 11000);
    const pct = (progress * 100).toFixed(1);

    railFill.style.height = `${pct}%`;
    railIndicator.style.top = `${pct}%`;
    railIndicator.textContent = `${currentDepth.toLocaleString()} M`;
    navDepthReadout.textContent = `${currentDepth.toLocaleString()} M · ${getZoneName(currentDepth)}`;

    // Progressive water darkening
    document.body.style.backgroundColor = interpolateWaterColor(progress);
    const darkness = (0.08 + progress * 0.86).toFixed(2);
    document.documentElement.style.setProperty("--depth-darkness", darkness);

    // Layered background parallax
    parallaxLayers.forEach(layer => {
        const rect = layer.parentElement.getBoundingClientRect();
        const speed = Number(layer.dataset.speed) || 0.2;
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = rect.top * speed;
            layer.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
        }
    });

    // Subtle foreground buoyancy parallax
    panelInners.forEach(inner => {
        const rect = inner.parentElement.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const floatOffset = rect.top * -0.04;
            inner.style.transform = `translate3d(0, ${floatOffset}px, 0)`;
        }
    });
});

document.getElementById("diveButton").addEventListener("click", () => {
    document.getElementById("sunlight").scrollIntoView({ behavior: "smooth" });
});


/* =================================
   3. ORGANIC UNDERWATER ECOSYSTEM
      (FISH, JELLYFISH, SQUID, KELP,
       BUBBLES & FLASHLIGHT REACTION)
================================= */

const canvas = document.getElementById("oceanCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Floating particles & rising bubbles
const particles = Array.from({ length: 75 }, (_, i) => {
    const isBubble = i % 4 === 0;
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: isBubble ? Math.random() * 2.6 + 1.2 : Math.random() * 1.4 + 0.4,
        vy: isBubble ? -(Math.random() * 0.85 + 0.35) : -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.3,
        isBubble,
        wobble: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.35 + 0.12
    };
});

// Swaying deep-water kelp / sea plants anchored along bottom/sides
const seaPlants = Array.from({ length: 9 }, (_, i) => ({
    x: (canvas.width / 8) * i + (Math.random() * 60 - 30),
    height: Math.random() * 140 + 90,
    segments: 8,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.015 + 0.008
}));

// Organic swimming creatures at different depths, sizes, and speeds
const creatures = [
    // Schooling fish
    ...Array.from({ length: 7 }, () => ({
        type: "fish",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        scale: Math.random() * 0.65 + 0.45, // varying distance/depth
        vx: (Math.random() * 0.8 + 0.4) * (Math.random() > 0.5 ? 1 : -1),
        phase: Math.random() * Math.PI * 2
    })),
    // Pulsing jellyfish
    ...Array.from({ length: 4 }, () => ({
        type: "jellyfish",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        scale: Math.random() * 0.7 + 0.55,
        vy: -(Math.random() * 0.35 + 0.15),
        phase: Math.random() * Math.PI * 2
    })),
    // Deep-sea squid
    ...Array.from({ length: 2 }, () => ({
        type: "squid",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        scale: Math.random() * 0.6 + 0.6,
        vx: (Math.random() * 0.6 + 0.35) * (Math.random() > 0.5 ? 1 : -1),
        phase: Math.random() * Math.PI * 2
    }))
];

function drawFish(c, litFactor, time) {
    ctx.save();
    ctx.translate(c.x, c.y);
    if (c.vx < 0) ctx.scale(-1, 1);
    ctx.scale(c.scale, c.scale);

    const tailWag = Math.sin(time * 0.08 + c.phase) * 5;
    const baseAlpha = 0.14 + litFactor * 0.65;

    ctx.fillStyle = `rgba(92, 225, 230, ${baseAlpha})`;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.quadraticCurveTo(4, -10, -14, -4);
    ctx.lineTo(-24, -10 + tailWag);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-24, 10 + tailWag);
    ctx.lineTo(-14, 4);
    ctx.quadraticCurveTo(4, 10, 18, 0);
    ctx.fill();

    // Illuminated detail: glowing eye & lateral line when caught in flashlight
    if (litFactor > 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${litFactor * 0.9})`;
        ctx.beginPath();
        ctx.arc(10, -2, 1.8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawJellyfish(c, litFactor, time) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.scale, c.scale);

    const pulse = Math.sin(time * 0.04 + c.phase);
    const bellW = 18 + pulse * 3;
    const bellH = 14 - pulse * 2;
    const baseAlpha = 0.16 + litFactor * 0.72;

    if (litFactor > 0.15) {
        ctx.shadowColor = "#5ce1e6";
        ctx.shadowBlur = 18 * litFactor;
    }

    // Bell
    ctx.fillStyle = `rgba(110, 235, 245, ${baseAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, bellW, Math.PI, 0);
    ctx.quadraticCurveTo(0, bellH * 0.4, -bellW, 0);
    ctx.fill();

    // Flowing tentacles
    ctx.strokeStyle = `rgba(110, 235, 245, ${baseAlpha * 0.75})`;
    ctx.lineWidth = 1.2;
    for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        ctx.moveTo(t * 5, 0);
        const sway = Math.sin(time * 0.05 + t + c.phase) * 6;
        ctx.quadraticCurveTo(t * 6 + sway, 18, t * 5 - sway, 36);
        ctx.stroke();
    }

    ctx.restore();
}

function drawSquid(c, litFactor, time) {
    ctx.save();
    ctx.translate(c.x, c.y);
    if (c.vx < 0) ctx.scale(-1, 1);
    ctx.scale(c.scale, c.scale);

    const baseAlpha = 0.14 + litFactor * 0.68;
    const tentacleWave = Math.sin(time * 0.06 + c.phase) * 4;

    if (litFactor > 0.15) {
        ctx.shadowColor = "#7df9ff";
        ctx.shadowBlur = 16 * litFactor;
    }

    ctx.fillStyle = `rgba(130, 220, 240, ${baseAlpha})`;
    // Mantle
    ctx.beginPath();
    ctx.moveTo(26, 0);
    ctx.lineTo(4, -9);
    ctx.lineTo(-10, -6);
    ctx.lineTo(-10, 6);
    ctx.lineTo(4, 9);
    ctx.closePath();
    ctx.fill();

    // Tentacles
    ctx.strokeStyle = `rgba(130, 220, 240, ${baseAlpha * 0.85})`;
    ctx.lineWidth = 1.4;
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-10, i * 2.2);
        ctx.quadraticCurveTo(-22, i * 3 + tentacleWave, -34, i * 2.5 - tentacleWave);
        ctx.stroke();
    }

    // Bioluminescent spots revealed by flashlight
    if (litFactor > 0.2) {
        ctx.fillStyle = `rgba(255, 255, 255, ${litFactor * 0.85})`;
        ctx.beginPath();
        ctx.arc(2, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(8, 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

let frameTime = 0;

function renderOcean() {
    frameTime++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Drifting sea plants along the bottom
    seaPlants.forEach(plant => {
        plant.phase += plant.speed;
        const distToLight = Math.hypot(mouseX - plant.x, mouseY - (canvas.height - plant.height / 2));
        const lit = Math.max(0, 1 - distToLight / 420);

        ctx.strokeStyle = `rgba(60, 185, 195, ${0.08 + lit * 0.35})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(plant.x, canvas.height);

        const tipX = plant.x + Math.sin(plant.phase) * 28;
        const tipY = canvas.height - plant.height;
        ctx.quadraticCurveTo(plant.x - Math.sin(plant.phase) * 14, canvas.height - plant.height * 0.5, tipX, tipY);
        ctx.stroke();
    });

    // 2. Floating particles, marine snow & bubbles (with subtle camera scroll parallax)
    const scrollShift = scrollVelocity * 0.15;
    scrollVelocity *= 0.9;

    particles.forEach(p => {
        p.wobble += 0.02;
        p.y += p.vy - scrollShift * (p.r * 0.4);
        p.x += p.vx + Math.sin(p.wobble) * 0.15;

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        const dist = Math.hypot(mouseX - p.x, mouseY - p.y);
        const litBoost = Math.max(0, 1 - dist / 380) * 0.45;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.isBubble) {
            ctx.strokeStyle = `rgba(175, 245, 255, ${p.alpha + litBoost})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.fillStyle = `rgba(120, 230, 240, ${p.alpha + litBoost})`;
            ctx.fill();
        }
    });

    // 3. Swimming sea creatures reacting to the wide flashlight beam
    creatures.forEach(c => {
        const dist = Math.hypot(mouseX - c.x, mouseY - c.y);
        const litFactor = Math.max(0, 1 - dist / 420);

        if (c.type === "fish") {
            c.x += c.vx * c.scale;
            c.y += Math.sin(frameTime * 0.02 + c.phase) * 0.25 - scrollShift * 0.2;
            if (c.x > canvas.width + 60) c.x = -60;
            if (c.x < -60) c.x = canvas.width + 60;
            drawFish(c, litFactor, frameTime);
        } else if (c.type === "jellyfish") {
            const pulseBoost = Math.max(0, Math.sin(frameTime * 0.04 + c.phase)) * 0.45;
            c.y += (c.vy - pulseBoost) * c.scale - scrollShift * 0.25;
            c.x += Math.sin(frameTime * 0.015 + c.phase) * 0.3;
            if (c.y < -60) c.y = canvas.height + 60;
            if (c.y > canvas.height + 60) c.y = -60;
            drawJellyfish(c, litFactor, frameTime);
        } else if (c.type === "squid") {
            c.x += c.vx * c.scale;
            c.y += Math.cos(frameTime * 0.018 + c.phase) * 0.3 - scrollShift * 0.2;
            if (c.x > canvas.width + 70) c.x = -70;
            if (c.x < -70) c.x = canvas.width + 70;
            drawSquid(c, litFactor, frameTime);
        }
    });

    requestAnimationFrame(renderOcean);
}
renderOcean();


/* =================================
   4. SIMPLE DEPTH CHECKER SLIDER
================================= */

const depthSlider = document.getElementById("depthSlider");
const depthNumber = document.getElementById("depthNumber");
const sliderSummary = document.getElementById("sliderSummary");

function updateDepthSlider() {
    const d = Number(depthSlider.value);
    depthNumber.textContent = `${d.toLocaleString()} m`;

    if (d <= 200) {
        sliderSummary.innerHTML = `<strong>Sunlight Zone:</strong> Bright and warm — Home of Sea Turtles, Dolphins, and Coral Reefs.`;
    } else if (d <= 1000) {
        sliderSummary.innerHTML = `<strong>Twilight Zone:</strong> Fading blue water — Home of glowing Jellyfish.`;
    } else if (d <= 4000) {
        sliderSummary.innerHTML = `<strong>Midnight Zone:</strong> Total darkness — Home of Giant Squid and Anglerfish.`;
    } else if (d <= 6000) {
        sliderSummary.innerHTML = `<strong>Abyssal Zone:</strong> Near-freezing ocean floor — Home of the Dumbo Octopus.`;
    } else {
        sliderSummary.innerHTML = `<strong>Hadal Zone:</strong> Deepest trenches on Earth — Home of the Hadal Snailfish.`;
    }
}

depthSlider.addEventListener("input", updateDepthSlider);
updateDepthSlider();


/* =================================
   5. PRESERVED QUIZ
================================= */

const questions = [
    {
        question: "Which ocean layer is the brightest and holds 90% of marine life?",
        answers: ["The Twilight Zone", "The Sunlight Zone", "The Abyssal Zone"],
        correct: 1,
        explanation: "The Sunlight Zone (0–200m) gets plenty of sun for plants and animals."
    },
    {
        question: "How do animals see or hunt in the pitch-dark Midnight Zone?",
        answers: ["They make their own glowing light", "Sunlight reaches them", "They use mirrors"],
        correct: 0,
        explanation: "Many deep-sea animals glow in the dark using bioluminescence."
    },
    {
        question: "What do animals in the deep Abyssal Zone eat?",
        answers: ["Seaweed from the floor", "Bits of food drifting down like snow", "Sunlight"],
        correct: 1,
        explanation: "Tiny bits of food drift down from upper waters like underwater snow."
    },
    {
        question: "Which fish can survive the extreme pressure of the Hadal Trench?",
        answers: ["Clownfish", "Hadal Snailfish", "Sea Turtle"],
        correct: 1,
        explanation: "The Hadal Snailfish has soft bones and no air pockets so pressure cannot crush it."
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const feedbackElement = document.getElementById("quizFeedback");
const nextButton = document.getElementById("nextQuestion");
const questionNumber = document.getElementById("questionNumber");

function loadQuestion() {
    answered = false;
    const q = questions[currentQuestion];

    questionNumber.textContent = `QUESTION 0${currentQuestion + 1} / 0${questions.length}`;
    questionElement.textContent = q.question;
    feedbackElement.textContent = "";
    nextButton.disabled = true;
    nextButton.textContent = currentQuestion === questions.length - 1 ? "SEE MY RESULTS →" : "NEXT QUESTION →";

    answersElement.innerHTML = "";
    q.answers.forEach((answer, index) => {
        const btn = document.createElement("button");
        btn.className = "answer";
        btn.textContent = answer;
        btn.addEventListener("click", () => checkAnswer(index, btn));
        answersElement.appendChild(btn);
    });
}

function checkAnswer(index, selectedBtn) {
    if (answered) return;
    answered = true;

    const q = questions[currentQuestion];
    const allBtns = document.querySelectorAll(".answer");
    allBtns.forEach(b => b.disabled = true);

    if (index === q.correct) {
        score++;
        selectedBtn.classList.add("correct");
        feedbackElement.textContent = "✓ " + q.explanation;
    } else {
        selectedBtn.classList.add("wrong");
        allBtns[q.correct].classList.add("correct");
        feedbackElement.textContent = "Not quite! " + q.explanation;
    }

    nextButton.disabled = false;
}

nextButton.addEventListener("click", () => {
    if (!answered) return;
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        questionNumber.textContent = "DIVE COMPLETE";
        questionElement.textContent = `YOU SCORED ${score} / ${questions.length}!`;
        answersElement.innerHTML = "";
        feedbackElement.textContent = score === questions.length
            ? "Amazing! You explored every layer of the ocean."
            : "Great dive! Scroll back up to review the ocean layers and try again.";
        nextButton.textContent = "PLAY AGAIN ↻";
        nextButton.onclick = () => {
            currentQuestion = 0;
            score = 0;
            nextButton.onclick = null;
            loadQuestion();
        };
    }
});

loadQuestion();


/* =================================
   6. SCROLL REVEAL
================================= */

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
