# Contributing Guidelines

## 1. In-Place CSS/JS Consolidation
Before adding a new CSS rule or JS behavior, **grep the codebase for existing selectors/behaviors with the same name or responsibility first**, and edit/consolidate in place rather than appending a new block at the end of the file.
- Do not append new rules to the end of a file if they override an existing rule. 
- If a rule must be overridden for a specific state, place it immediately adjacent to the original declaration.

## 2. Strict Asset Verification
Before committing any changes involving images, videos, or fonts, **any new image/media reference must be validated against the actual filename on disk (not assumed)**.
- Ensure the asset is placed in the `public/` directory (e.g., `public/works/`) or `src/assets/`.
- Ensure `vite.config.js` and `.gitignore` are configured such that build outputs (`dist/`, `assets/`) are never tracked as source code.
- Run `npm run build` and ensure no errors appear for missing assets.
