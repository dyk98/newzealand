# AGENTS.md

## Project

- This app is a Vite + React static site with Capacitor/Android packaging. Cloudflare deploys should publish the Vite `dist/` output, not the `android/` tree or `node_modules/`.
- The production Pages project is `newzealand`; the public domain is `https://newzealand.castaly.site`.

## Cloudflare Deploy

- Use `npm run deploy:cloudflare` for the one-shot deploy path. It installs dependencies if needed, runs `npm run build`, deploys `dist/` to Cloudflare Pages, reconciles the custom domain, and verifies the public site.
- The script loads Cloudflare credentials from `/root/castaly/.runtime/secrets/cloudflare-api-token.env` unless `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_TOKEN_FILE` is provided in the environment. Never print, copy, commit, or document token values.
- Cloudflare constants used by this app:
  - Account: `fbe04ccb1b97131b2bda03a81836a4c4`
  - Zone `castaly.site`: `96f7311bc2550a974a6fead412eea684`
  - Pages target: `newzealand-e82.pages.dev`
- `castaly.site` has a wildcard Worker route `*.castaly.site/*` for Castaly publish dispatch. Keep the more specific disabled route `newzealand.castaly.site/*` with `script: null`; otherwise this site is intercepted by `castaly-publish-dispatch` and returns Castaly `not_found`.
- Keep the exact proxied DNS CNAME `newzealand.castaly.site -> newzealand-e82.pages.dev`. Do not delete or alter the wildcard route for the broader Castaly platform.

## Verification

- After deploy, verify `https://newzealand.castaly.site` returns the Vite HTML and that the referenced `/assets/*.js` and `/assets/*.css` files return 200.
- Pages custom domain status may remain `pending` briefly while Cloudflare finishes validation/certificate bookkeeping; public HTTP 200 from the custom domain is the practical deploy check.
