# Asteroids Agent Guide

## Run and verify

- This is a dependency-free static site: open `index.html` in a browser, or run `npx serve .` and visit `http://localhost:3000`.
- There are no configured build, lint, typecheck, or automated test commands. Verify gameplay changes manually in a browser.

## Architecture

- `index.html` owns the page, inline styling, and the `800x600` `<canvas>`; it loads `game.js` as a classic (non-module) script.
- `game.js` contains all game state, entities, input handlers, rendering, collision logic, and the `requestAnimationFrame` loop. Keep additions compatible with a global classic-script scope.
- The canvas dimensions in `index.html` must stay aligned with `W` and `H` in `game.js`; movement and rendering use those constants for wrapping and positioning.
- `pressed()` consumes a key's edge-triggered state. It is intentionally used for one-shot actions such as firing and game restart; continuous controls read `keys` directly.
