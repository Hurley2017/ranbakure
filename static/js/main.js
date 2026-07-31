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
    initRouteMap();
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

/* ---------- ROUTE MAP ---------- */
function initRouteMap() {
    const mapEl = document.getElementById("routeMap");
    if (!mapEl || typeof L === "undefined") return;

    const map = L.map("routeMap", {
        center: [27.85, 75.27], // Nawalgarh area
        zoom: 12,
        scrollWheelZoom: false,
        attributionControl: false,
    });

    // Dark-themed tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
    }).addTo(map);

    let bounds = L.latLngBounds();
    const statsEl = document.getElementById("routeStats");
    let loadedCount = 0;
    const statsData = [];

    // Color config per route
    const routeConfig = {
        gpx: { color: "#e8a838", weight: 4, opacity: 0.9, label: "Legacy — 100K" },
        kml: { color: "#6bafd4", weight: 4, opacity: 0.9, label: "Heritage — 53K" },
    };

    // Parse GPX
    if (window.ROUTE_GPX_URL) {
        fetch(window.ROUTE_GPX_URL)
            .then(r => r.text())
            .then(xml => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(xml, "application/xml");
                const tracks = doc.querySelectorAll("trkpt");
                const pts = [];
                tracks.forEach(pt => {
                    const lat = parseFloat(pt.getAttribute("lat"));
                    const lon = parseFloat(pt.getAttribute("lon"));
                    if (!isNaN(lat) && !isNaN(lon)) pts.push([lat, lon]);
                });
                if (pts.length) {
                    const poly = L.polyline(pts, routeConfig.gpx).addTo(map);
                    pts.forEach(p => bounds.extend(p));
                    const dist = calcDistance(pts);
                    statsData.push({ label: routeConfig.gpx.label, dist, color: routeConfig.gpx.color });
                    loadedCount++;
                    updateStats();
                }
            })
            .catch(() => console.warn("GPX load failed"));
    }

    // Parse KML
    if (window.ROUTE_KML_URL) {
        fetch(window.ROUTE_KML_URL)
            .then(r => r.text())
            .then(xml => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(xml, "application/xml");
                const coordsEl = doc.querySelector("coordinates");
                if (!coordsEl) return;
                const raw = coordsEl.textContent.trim();
                const pts = [];
                raw.split(/\s+/).forEach(triple => {
                    const [lon, lat] = triple.split(",").map(Number);
                    if (!isNaN(lat) && !isNaN(lon)) pts.push([lat, lon]);
                });
                if (pts.length) {
                    L.polyline(pts, routeConfig.kml).addTo(map);
                    pts.forEach(p => bounds.extend(p));
                    const dist = calcDistance(pts);
                    statsData.push({ label: routeConfig.kml.label, dist, color: routeConfig.kml.color });
                    loadedCount++;
                    updateStats();
                }
            })
            .catch(() => console.warn("KML load failed"));
    }

    function updateStats() {
        if (statsEl && statsData.length) {
            statsEl.innerHTML = statsData
                .map(d => `<span><span style="color:${d.color}">●</span> <strong>${d.label}:</strong> ~${Math.round(d.dist)} km</span>`)
                .join("");
        }
    }

    // Fit bounds after routes load (polling)
    const fitInterval = setInterval(() => {
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40] });
            clearInterval(fitInterval);
        }
    }, 500);
    // Safety stop
    setTimeout(() => clearInterval(fitInterval), 8000);

    // Add start/finish marker at MJF Sports Ground
    const mjf = [27.8515, 75.2680];
    L.circleMarker(mjf, {
        radius: 8,
        color: "#fff",
        fillColor: "#c9a24e",
        fillOpacity: 1,
        weight: 2,
    }).addTo(map).bindPopup("<strong>MJF Sports Ground</strong><br>Start &amp; Finish").openPopup();
    bounds.extend(mjf);
}

/* Haversine distance for polyline points */
function calcDistance(pts) {
    const R = 6371;
    let d = 0;
    for (let i = 1; i < pts.length; i++) {
        const [lat1, lon1] = pts[i - 1];
        const [lat2, lon2] = pts[i];
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        d += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return d;
}

