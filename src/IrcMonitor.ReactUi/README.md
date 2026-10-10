# IrcMonitor React UI

React and TypeScript frontend built with Vite. The existing `src` and `public` directories are retained; `index.html` is the Vite entry point at the project root.

## Requirements

- Node.js 20.19+ or 22.12+ (Node 22 LTS recommended).
- .NET SDK for the ASP.NET Core development HTTPS certificate.

## Development

```sh
npm install
npm start
```

`npm start` exports the ASP.NET Core development certificate and starts Vite at **https://localhost:5173**. `npm run dev` runs the same setup. Trust the certificate with `dotnet dev-certs https --trust` if needed. Run the backend separately at https://localhost:5001; the generated API client continues to call it directly in development.

Set `VITE_GOOGLE_APP_ID` in `.env.local` to the Google OAuth client ID, and configure https://localhost:5173 as an authorized JavaScript origin for that client. The existing `REACT_APP_GOOGLE_APP_ID` deployment variable is also supported as a fallback. Client environment variables are public and must not contain secrets.

The certificate helpers store `SSL_CRT_FILE` and `SSL_KEY_FILE` in `.env.development.local`. Vite reads these paths for HTTPS. Imports relative to `src`, such as `framework/App` and `utilities/routes`, remain supported.

## Build and preview

```sh
npm run build
npm run preview
```

The build checks TypeScript and writes production assets to Vite's default `dist/` folder. Deployment copies these assets into the backend's `wwwroot`. Preview serves the production bundle locally; API calls use the same origin in production, so a full integration requires the ASP.NET backend to serve the built assets.

## Tests

```sh
npm test
npm run test:ci
```

Tests use Vitest with jsdom and React Testing Library. `npm test` watches for changes; `npm run test:ci` runs once. Use `npm ci` for reproducible installs in CI.
