# RunPilot AI

RunPilot AI is a static Vue 3 single-page running training planner.

## Current Shape

- Main deployable entry: `index.html`
- H5 export entry: `dist/build/h5/index.html`
- Runtime data storage: browser `localStorage`
- Backend/API requirement: none
- External runtime dependency: Vue 3 from `https://unpkg.com/vue@3/dist/vue.global.prod.js`

## Local Preview

```bash
npm install
npm run dev
```

Then open the local URL printed by `serve`.

Because the app is static, you can also open `index.html` directly in a browser.

## Deployment

### Vercel

1. Import the repository into Vercel.
2. Framework preset: Other.
3. Build command: `npm run build`.
4. Output directory: `.`.

### Netlify

1. Import the repository into Netlify.
2. Build command: `npm run build`.
3. Publish directory: `.`.

### GitHub Pages

Deploy the repository root. The `.nojekyll` file is included so GitHub Pages serves static files without Jekyll processing.

## Notes

- Do not deploy `node_modules`; it is ignored by `.gitignore`.
- The current app depends on the public Unpkg CDN at runtime. For stricter production reliability, vendor Vue locally or pin the CDN URL to a specific Vue version.
- The repo currently does not include the original source project files, so improvements should be made carefully in `index.html` unless the source is recovered.
