/**
 * RANBAKURE — Shekhawati Ultra
 * YouTube background, distance tabs, scroll reveals, particles, mobile nav.
 */

document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initNavbar();
    initMobileNav();
    initDistanceTabs();
    initScrollReveal();
    initParticles();
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
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", hide);
    } else {
        hide();
    }
    window.addEventListener("load", hide);
    setTimeout(hide, 3000);
}

/* ---------- NAVBAR ---------- */
function initNavbar() {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
}

/* ---------- MOBILE NAV ---------- */
function initMobileNav() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
        links.classList.toggle("open");
    });

    // Close on link click
    links.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            links.classList.remove("open");
        });
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
        if (!toggle.contains(e.target) && !links.contains(e.target)) {
            links.classList.remove("open");
        }
    });
}

/* ---------- DISTANCE TABS ---------- */
function initDistanceTabs() {
    const tabs = document.querySelectorAll(".dist-tab");
    const panels = document.querySelectorAll(".dist-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const dist = tab.dataset.dist;
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            const panel = document.querySelector(`.dist-panel[data-panel="${dist}"]`);
            if (panel) panel.classList.add("active");
        });
    });
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    document.querySelectorAll("[data-scroll]").forEach(el => observer.observe(el));
}

/* ---------- PARTICLES ---------- */
function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height;
    const particles = [];
    const count = 50;

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
            this.size = Math.random() * 1.8 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.15;
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
            ctx.fillStyle = `rgba(201,162,78,${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(ctx); });

        // Connect nearby
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(201,162,78,${0.03 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}
