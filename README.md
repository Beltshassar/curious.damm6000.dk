# curious.damm6000.dk

A playful deck of Daniel Damm's geeky side projects — geocaching puzzles, kids'-club electronics workshops, home automation tinkering.

## Concept

Each project is a card in a deck (think trading cards / Pokémon cards), with a LEGO-bright yellow frame and a colored category banner. Only the top card is visible, fanned out slightly over the rest. Drag or swipe it away to cycle it to the back of the deck and reveal the next one; tap it to flip it over and reveal the goal/concept/setup/outcome/story/photos on the back.

## Stack

Vue 3 + Vite, plus `@vueuse/core` for Escape-key handling on the flipped card, and `vite-imagetools` to automatically resize/compress photos at build time. No backend, no router, no state library — a couple of reactive composables are enough.

## Adding a new project

Add a new folder under `src/content/projects/<slug>/`:

```
src/content/projects/<slug>/
  meta.json   # title, tagline, category, order, status, goal, concept, setup[], outcome, coverImage, gallery[]
  story.md    # free-text narrative paragraphs
  images/     # cover.jpg, 01.jpg, 02.jpg, ... referenced from meta.json
```

It's picked up automatically via `import.meta.glob` in `src/content/loadProjects.js` — no code changes needed. If `coverImage`/`gallery` are missing or the referenced file doesn't exist yet, a generated placeholder is shown instead, so photos can be added later without touching any component. Photos dropped into `images/` are automatically resized/compressed at build time (see `vite.config.js`), so there's no need to shrink them yourself first.

`category` controls the card's banner/border color — a few categories have curated colors in `src/utils/color.js`, any new category gets a deterministic color automatically.

## Local development

```
npm install
npm run dev
```

## Build & deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with Vite and deploys to GitHub Pages (Pages source must be set to "GitHub Actions" once in the repo settings). `public/CNAME` pins the custom domain `curious.damm6000.dk`; the DNS record for that subdomain is managed outside this repo.
