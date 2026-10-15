# Wire Reels
Electrician-themed conveyor-sort puzzle (Yarn Loop style). Play: https://bgwinn24.github.io/wire-reels/
- `pictures.js` — pixel pictures (add one = add a level). Optional 3rd field = outline colour.
- `logic.js` — rules, level generator, DFS solver. `node build-levels.js` regenerates `levels.js`.
- `node test.js` — rule tests + verifies every shipped level is winnable.
Levels past the shipped set are generated endlessly (solver-checked in the browser).
