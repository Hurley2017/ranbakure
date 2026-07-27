/**
 * INDIA MARATHON — Main JavaScript
 * Particle canvas, scroll animations, counters, and interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initParticles();
    initNavbar();
    initScrollReveal();
    initCounters();
});

/* ---------- LOADER ---------- */
function initLoader() {
    const loader = document.getElementById("loader");
    let hidden = false;
    const hide = () => {
        if (hidden) return;
        hidden = true;
        setTimeout(() => loader.classList.add("hidden"), 400);
    };
    // Hide when DOM is ready (don't wait for fonts/images)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", hide);
    } else {
        hide();
    }
    // Also try on full load as backup
    window.addEventListener("load", hide);
    // Hard fallback after 3 seconds
    setTimeout(hide, 3000);
}

/* ---------- PARTICLE CANVAS ---------- */
function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height;
    const particles = [];
    const particleCount = 80;
    const colors = [
        "rgba(255,153,51,0.6)",  // saffron
        "rgba(255,255,255,0.4)",  // white
        "rgba(19,136,8,0.6)",     // green
        "rgba(255,215,0,0.5)",    // gold
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.7 + 0.3;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
                this.reset();
            }
        }
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Connect nearby particles
    function drawConnections(ctx) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        drawConnections(ctx);
        requestAnimationFrame(animate);
    }
    animate();
}

/* ---------- NAVBAR SCROLL EFFECT ---------- */
function initNavbar() {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, observerOptions);

    document.querySelectorAll("[data-scroll]").forEach(el => observer.observe(el));
}

/* ---------- COUNTER ANIMATION ---------- */
function initCounters() {
    const counters = document.querySelectorAll(".stat-number[data-count]");
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counters.forEach(counter => animateCounter(counter));
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector(".hero-stats");
    if (statsSection) observer.observe(statsSection);
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target.toLocaleString();
        }
    }
    requestAnimationFrame(update);
}
