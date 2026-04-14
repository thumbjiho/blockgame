# JBL — Jojo's Blockgame Laboratory

A modern block stacker sprint built with React + Vite.

Live: **[blockgame.umjo.me](https://blockgame.umjo.me)**

## Credits & Inspiration

This project's timing, attack table, kick data, and randomizer behavior were studied from **[Jstris](https://jstris.jezevec10.com/)** by [Jezevec10](https://github.com/Jezevec10). Huge thanks to the Jstris project and its community for open-sourcing their work under GPL — this project would not exist without that generosity.

JBL is an independent, non-affiliated project. It is not endorsed by or connected to Jstris or The Tetris Company. Core mechanics follow the publicly documented [SRS Guideline](https://tetris.wiki/Super_Rotation_System).

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
```

## Deployment

Auto-deployed to GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on every push to `main`.
