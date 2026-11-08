# Rolex Submariner Date — Haute Horlogerie Digital Showcase

An immersive, museum-grade web experience uniting quiet luxury Swiss horology aesthetics with an ultra-responsive 60fps/120fps hardware-accelerated dual-video canvas scroll engine.

![Rolex Submariner Date](assets/images/iwc_portugieser_1793958028577.jpg)

## Features

- **Hardware-Accelerated Canvas Engine**: 60fps/120fps scrubbing through 238 high-definition WebP frames synchronized to smooth scroll velocity (LERP interpolation).
- **Interactive Deconstruction Phase**: Dynamic SVG vector leader lines projecting from physical watch components (Cerachrom Bezel, Emerald Sunray Dial, Calibre 3235 Perpetual Movement, 904L Oystersteel Case, and Hermetic Fluted Seal).
- **Macro Reassembly Showcase**: Close-up inspection of the patented Triplock winding crown with responsive optical typography.
- **Curated Horology Sections**:
  - The Timepieces Showcase with interactive category filters.
  - Manufacture & Atelier editorial storytelling.
  - The Journal articles on Swiss watchmaking innovation.
  - Private Client Salons & Boutique locator.
- **Performance & PWA Ready**: Preloaded milestone frames, lazy-loaded off-screen imagery, and immutable asset caching.

## Tech Stack

- **Markup & Semantics**: Semantic HTML5, accessible ARIA roles, modern schema metadata.
- **Styling**: Vanilla CSS3, custom properties, fluid typographic clamping, custom font pairings (`Cinzel`, `Plus Jakarta Sans`, `JetBrains Mono`).
- **Engine**: Pure Vanilla JavaScript (ES6+), HTML5 Canvas 2D Context, requestAnimationFrame render loop, passive wheel/touch listeners.
- **Deployment**: Vercel Edge Network.

## Getting Started

To run locally:

```bash
# Clone the repository
git clone https://github.com/AbhishekMukherjee-BD/rolex-submariner-experience.git

# Navigate to the project directory
cd rolex-submariner-experience

# Start a local static server
python3 -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000` in your browser.

---

Crafted with obsessive precision for haute horlogerie enthusiasts.
