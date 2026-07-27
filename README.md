# Ranbakure — Shekhawati Ultra Marathon

**Live Site:** [ranbakure.com](https://ranbakure.com)  
**GitHub:** [github.com/Hurley2017/ranbakure](https://github.com/Hurley2017/ranbakure)

> ⚠️ **Commercial Project** — This is a proprietary, client-facing project. Unauthorized use, distribution, or reproduction is prohibited.

---

## About

Invitation landing page for the **Shekhawati Ultra Marathon**. A single-page animated website showcasing India's cultural heritage and the marathon spirit, with a call-to-action redirecting runners to register via [Konfhub](https://konfhub.com/shekhawati-ultra).

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Flask (Python) |
| Frontend | HTML5, CSS3, Vanilla JS |
| Deployment | Vercel (auto-deploy on push) |
| Domain | ranbakure.com |
| Registration | Konfhub |

## Features

- Tricolor-themed animated hero with Ashoka Chakra SVG
- Particle canvas background (saffron, white, green, gold)
- Animated marathon runner silhouettes
- Scroll-triggered reveal animations
- Animated stat counters
- Culture showcase cards
- Race-day timeline
- Responsive design (mobile-friendly)
- Custom favicon & logo

## Local Development

```bash
pip install -r requirements.txt
python app.py
# Open http://127.0.0.1:5000
```

## Deployment

Pushes to `main` trigger automatic Vercel deployments. The `vercel.json` routes all traffic through `api/index.py` (serverless Flask entrypoint).

---

&copy; 2026 Ranbakure. All rights reserved.

