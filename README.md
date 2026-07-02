# Angular Esprit Connect

This repository contains the frontend for the Esprit Connect project.

## Current status
- Branch: `Esprit-Connect-Frontend`
- Angular version: 18.2.x
- Server-side rendering support via Angular SSR
- Uses Angular Material, social login, and Express for SSR serving

## Project structure
- `src/app/` — main Angular application code
- `src/assets/` — static assets and email templates
- `src/environments/` — environment configuration files
- `server.ts` — Express server entry point for SSR
- `angular.json` / `tsconfig.json` — build configuration

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm start
   ```
3. Open `http://localhost:4200/`

## Build and serve
- Build the browser app:
  ```bash
  npm run build
  ```
- For SSR production-like serving:
  ```bash
  npm run serve:ssr:Angular-EspritConnect
  ```

## Tests
- Unit tests:
  ```bash
  npm test
  ```
- End-to-end tests:
  ```bash
  npm run e2e
  ```

## Important dependencies
- `@angular/core`, `@angular/material`, `@angular/platform-server`
- `@abacritt/angularx-social-login` for social authentication
- `express` for SSR server hosting
- `rxjs`, `zone.js`

## Notes
- This frontend is designed to work with the backend service in `EspritConnect-1`.
- Update `src/environments/environment.ts` with the backend API URL before running against a live backend.
