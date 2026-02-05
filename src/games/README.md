# Games Directory

All individual games will live in their own subdirectories here.
Each game should function as a standalone module that imports shared resources from `../core` and `../ui`.

## Adding a new game:
1. Create a new folder, e.g., `neon-flow`.
2. Add an `index.js` as the entry point.
3. Import it in the main `src/main.js` to register it in the Lobby.
