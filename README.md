# Quiet Tracker

A calm, simple tracker for your iPhone. White and soft pastels, nothing flashing, nothing to chase.

**Today** — log your mood, glasses of water, meditation minutes and whether you worked out. Tap ‹ to fill in earlier days. Any "check it off" goals you've set (like *Write*) show up here too.

**Year** — set goals like *Meditate 180 days this year* or *Write 180 days until June 30*. Each goal shows how many days are done, how many are left, and a small marker for where an even pace would be. Below that, a quiet year grid for mood, water, meditation, workouts or any of your own goals. Tap a day to open it.

**Settings** — daily water goal, save/restore a backup, erase everything.

All data stays on your phone (no account, no server).

## Put it on your iPhone

The app is a web app you install to your Home Screen. It opens full screen and works offline.

1. Host it somewhere. Easiest with this repo:
   - **GitHub Pages:** in the repo on GitHub go to *Settings → Pages* and set *Source* to **GitHub Actions**. Every push to `main` then deploys automatically (workflow in `.github/workflows/deploy.yml`). Your address will be `https://<your-username>.github.io/habit-track-zone/`.
   - **Lovable:** *Share → Publish* also works.
2. Open that address in **Safari** on your iPhone.
3. Tap the **Share** button → **Add to Home Screen**.

Save a backup from Settings now and then. iOS keeps Home Screen app data, but a backup protects you if you change phones.

## Develop

```sh
npm install
npm run dev     # local dev server
npm run build   # production build in dist/
```

Built with Vite, React and TypeScript. Code lives in `src/`:
`lib/store.ts` (data + goal maths), `lib/dates.ts`, and the three screens in `screens/`.
