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
    initRouteMap();
    initCountdown();
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

/* ---------- ROUTE MAP (Leaflet — Tabbed single map) ---------- */
function initRouteMap() {
    if (typeof L === "undefined") { console.warn("Leaflet not loaded"); return; }

    const map = L.map("routeMap", {
        center: [27.85, 75.27], zoom: 12,
        scrollWheelZoom: false, attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd", maxZoom: 19,
    }).addTo(map);

    addMJFMarker(map);

    const tabs = document.querySelectorAll("#routeTabs .dist-tab");

    // Store loaded routes
    const routes = {};
    let activeRoute = "legacy";

    // Color config
    const config = {
        legacy:  { color: "#e8a838", label: "Legacy — 100K", url: window.ROUTE_GPX_URL, parser: "gpx", cutOff: "16 Hours", surface: "Road &amp; Trail", aid: "12" },
        heritage:{ color: "#5b9ecf", label: "Heritage — 50K", url: window.ROUTE_KML_URL, parser: "kml", cutOff: "8 Hours", surface: "Mixed Terrain", aid: "12" },
        origins: { color: "#7bc47f", label: "Origins — 30K", url: window.ROUTE_ORIGINS_URL, parser: "gpx", cutOff: "4 Hours", surface: "Road &amp; Trail", aid: "6" },
    };

    // Load each route on demand
    function loadRoute(key) {
        if (routes[key]) {
            showRoute(key);
            return;
        }
        const cfg = config[key];
        if (!cfg || !cfg.url) return;

        fetch(cfg.url)
            .then(r => r.text())
            .then(xml => {
                const pts = cfg.parser === "gpx" ? parseGPX(xml) : parseKML(xml);
                console.log(`${cfg.label} points:`, pts.length);
                if (pts.length) {
                    // Store as Leaflet layer group
                    const group = L.layerGroup();
                    L.polyline(pts, { color: cfg.color, weight: 5, opacity: 1 }).addTo(group);
                    L.polyline(pts, { color: "#fff", weight: 1.5, opacity: 0.35, dashArray: "8, 12" }).addTo(group);
                    routes[key] = group;
                    showRoute(key);
                }
            }).catch(e => console.warn(`${cfg.label} load failed:`, e));
    }

    function showRoute(key) {
        // Remove all route layers
        Object.values(routes).forEach(g => map.removeLayer(g));
        // Add selected
        if (routes[key]) {
            routes[key].addTo(map);
            const group = routes[key].getLayers();
            if (group.length) {
                const poly = group[0];
                map.fitBounds(poly.getBounds(), { padding: [30, 30] });
            }
        }
        // Update description panel
        const cfg = config[key];
        const descTitle = document.getElementById("routeDescTitle");
        const descStats = document.getElementById("routeDescStats");
        const descText = document.getElementById("routeDescText");
        if (descTitle) descTitle.textContent = cfg.label;
        if (descStats) {
            descStats.innerHTML = `
                <div class="rds-item"><span class="rds-label">DISTANCE</span><span class="rds-val">${cfg.label.split("—")[1]?.trim() || cfg.label}</span></div>
                <div class="rds-item"><span class="rds-label">CUT-OFF</span><span class="rds-val">${cfg.cutOff}</span></div>
                <div class="rds-item"><span class="rds-label">SURFACE</span><span class="rds-val">${cfg.surface}</span></div>
                <div class="rds-item"><span class="rds-label">AID STATIONS</span><span class="rds-val">${cfg.aid}</span></div>
            `;
        }
        const descs = {
            legacy: "The ultimate test of endurance. Run from dawn to dusk across the full canvas of Shekhawati's timeless landscape — every kilometre a story, every stride a tribute.",
            heritage: "The perfect middle distance. Challenging enough to demand respect, framed by Rajasthan's breathtaking painted havelis and heritage views.",
            origins: "A fast, accessible introduction to ultramarathon running. Experience the soul of Shekhawati at a pace that lets you take it all in.",
        };
        if (descText) descText.textContent = descs[key] || "";
    }

    // Tab click handler
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeRoute = tab.dataset.route;
            loadRoute(activeRoute);
        });
    });

    // Initial load
    loadRoute("legacy");
}

function parseGPX(xml) {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const pts = [];
    doc.querySelectorAll("trkpt").forEach(pt => {
        const lat = parseFloat(pt.getAttribute("lat"));
        const lon = parseFloat(pt.getAttribute("lon"));
        if (!isNaN(lat) && !isNaN(lon)) pts.push([lat, lon]);
    });
    return pts;
}

function parseKML(xml) {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const coordsEl = doc.querySelector("coordinates");
    if (!coordsEl) return [];
    const raw = coordsEl.textContent.trim();
    const pts = [];
    raw.split(/\s+/).forEach(t => {
        const [lon, lat] = t.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lon)) pts.push([lat, lon]);
    });
    return pts;
}

/* Add MJF Sports Ground marker to a Leaflet map */
function addMJFMarker(map) {
    const mjfIcon = L.divIcon({
        className: "mjf-leaflet-marker",
        html: '<div class="mjf-leaflet-dot"></div><div class="mjf-leaflet-ring"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
    L.marker([27.8515, 75.268], { icon: mjfIcon })
        .addTo(map)
        .bindPopup("<strong>MJF Sports Ground</strong><br>Start &amp; Finish");
}

/* ---------- COUNTDOWN TIMER ---------- */
function initCountdown() {
    const raceDate = new Date("2026-09-27T06:00:00+05:30").getTime();
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");
    if (!daysEl) return;

    function tick() {
        const now = Date.now();
        const diff = Math.max(0, raceDate - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        daysEl.textContent = String(days).padStart(2, "0");
        hoursEl.textContent = String(hours).padStart(2, "0");
        minsEl.textContent = String(mins).padStart(2, "0");
        secsEl.textContent = String(secs).padStart(2, "0");
        if (diff > 0) requestAnimationFrame(() => setTimeout(tick, 1000));
    }
    tick();
}

