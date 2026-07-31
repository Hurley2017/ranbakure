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

/* ---------- ROUTE MAP (MapLibre GL) ---------- */
function initRouteMap() {
    const mapEl = document.getElementById("routeMap");
    if (!mapEl || typeof maplibregl === "undefined") { console.warn("MapLibre not loaded"); return; }

    // Inline dark style — reliable, no API key needed
    const darkStyle = {
        version: 8,
        sources: {
            "carto-dark": {
                type: "raster",
                tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"],
                tileSize: 256,
                attribution: '&copy; CARTO',
            },
        },
        layers: [{
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark",
            minzoom: 0,
            maxzoom: 22,
        }],
    };

    const map = new maplibregl.Map({
        container: "routeMap",
        style: darkStyle,
        center: [75.27, 27.85],
        zoom: 12,
        scrollZoom: false,
        attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    const statsEl = document.getElementById("routeStats");
    const statsData = [];
    let bounds = new maplibregl.LngLatBounds();

    // Wait for map to load before adding routes
    map.on("load", () => {
        // MJF marker
        const mjfEl = document.createElement("div");
        mjfEl.className = "mjf-marker";
        mjfEl.innerHTML = '<div class="mjf-pulse"></div><div class="mjf-dot"></div>';
        new maplibregl.Marker({ element: mjfEl, anchor: "center" })
            .setLngLat([75.268, 27.8515])
            .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false })
                .setHTML("<strong>MJF Sports Ground</strong><br>Start &amp; Finish"))
            .addTo(map);
        bounds.extend([75.268, 27.8515]);

        // Load GPX
        if (window.ROUTE_GPX_URL) {
            fetch(window.ROUTE_GPX_URL)
                .then(r => r.text())
                .then(xml => {
                    const doc = new DOMParser().parseFromString(xml, "application/xml");
                    const pts = [];
                    doc.querySelectorAll("trkpt").forEach(pt => {
                        const lat = parseFloat(pt.getAttribute("lat"));
                        const lon = parseFloat(pt.getAttribute("lon"));
                        if (!isNaN(lat) && !isNaN(lon)) pts.push([lon, lat]);
                    });
                    console.log("GPX points:", pts.length);
                    if (pts.length) {
                        addGlowingRoute(map, pts, "#e8a838", "legacy-route");
                        pts.forEach(p => bounds.extend(p));
                        statsData.push({ label: "Legacy — 100K", dist: calcDistanceGeo(pts), color: "#e8a838" });
                        updateStats();
                        fitMap();
                    }
                }).catch(e => console.warn("GPX load failed:", e));
        }

        // Load KML
        if (window.ROUTE_KML_URL) {
            fetch(window.ROUTE_KML_URL)
                .then(r => r.text())
                .then(xml => {
                    const doc = new DOMParser().parseFromString(xml, "application/xml");
                    const coordsEl = doc.querySelector("coordinates");
                    if (!coordsEl) { console.warn("No coordinates in KML"); return; }
                    const raw = coordsEl.textContent.trim();
                    const pts = [];
                    raw.split(/\s+/).forEach(t => {
                        const [lon, lat] = t.split(",").map(Number);
                        if (!isNaN(lat) && !isNaN(lon)) pts.push([lon, lat]);
                    });
                    console.log("KML points:", pts.length);
                    if (pts.length) {
                        addGlowingRoute(map, pts, "#5b9ecf", "heritage-route");
                        pts.forEach(p => bounds.extend(p));
                        statsData.push({ label: "Heritage — 53K", dist: calcDistanceGeo(pts), color: "#5b9ecf" });
                        updateStats();
                        fitMap();
                    }
                }).catch(e => console.warn("KML load failed:", e));
        }

        // Fallback: fit if no routes load after 5s
        setTimeout(fitMap, 5000);
    });

    function updateStats() {
        if (statsEl && statsData.length) {
            statsEl.innerHTML = statsData
                .map(d => `<span><span style="color:${d.color}">●</span> <strong>${d.label}:</strong> ~${Math.round(d.dist)} km</span>`)
                .join("");
        }
    }

    function fitMap() {
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 2000 });
        }
    }
}

/* Add a glowing route line (glow layer + core layer + animated dash) */
function addGlowingRoute(map, coords, color, id) {
    if (!map.loaded()) return;

    map.addSource(`${id}-source`, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: coords } },
    });

    // Outer glow
    map.addLayer({
        id: `${id}-glow`,
        type: "line",
        source: `${id}-source`,
        paint: {
            "line-color": color,
            "line-width": 8,
            "line-opacity": 0.2,
            "line-blur": 4,
        },
    });

    // Core line
    map.addLayer({
        id: `${id}-core`,
        type: "line",
        source: `${id}-source`,
        paint: {
            "line-color": color,
            "line-width": 3,
            "line-opacity": 0.9,
        },
    });

    // Animated dash overlay
    map.addLayer({
        id: `${id}-dash`,
        type: "line",
        source: `${id}-source`,
        paint: {
            "line-color": "#fff",
            "line-width": 2,
            "line-opacity": 0.5,
            "line-dasharray": [0, 4, 2],
        },
    });

    // Animate the dash
    let dashOffset = 0;
    function animateDash() {
        dashOffset = (dashOffset + 0.3) % 100;
        if (map.getLayer(`${id}-dash`)) {
            map.setPaintProperty(`${id}-dash`, "line-dasharray", [dashOffset % 8, 4, 2, 4]);
        }
        requestAnimationFrame(animateDash);
    }
    animateDash();
}

/* Haversine distance (coords are [lon, lat] arrays from MapLibre) */
function calcDistanceGeo(pts) {
    const R = 6371;
    let d = 0;
    for (let i = 1; i < pts.length; i++) {
        const [lon1, lat1] = pts[i - 1];
        const [lon2, lat2] = pts[i];
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        d += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return d;
}

