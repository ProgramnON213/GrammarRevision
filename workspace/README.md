# Grammar Workbook

A grammar practice website built with React, TypeScript, Vite, Tailwind, and Zustand.
It loads question banks from JSON files under `src/data`.

## Local Development

```bash
npm install
npm run dev
```

## Data Source

- Add one or more `.json` files under `src/data/`
- Each file can contain an array of objects like:

```json
[
  {
    "category": "Tenses",
    "subcategory": "Past Simple",
    "question": "We _____ (play) soccer at the park yesterday.",
    "options": ["play", "played", "playing", "plays"],
    "correctAnswer": "played",
    "explanation": "For regular verbs in the Past Simple, we add '-ed' to the end of the base verb."
  }
]
```

## GitHub Pages

This repo is configured for GitHub Pages deployment through GitHub Actions.

### 1. Create a GitHub repository

Create a new repository on GitHub, then connect this project to it:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Enable GitHub Pages

- Open your repository on GitHub
- Go to `Settings` → `Pages`
- Under `Build and deployment`, set `Source` to `GitHub Actions`

### 3. Deploy

Every push to `main` triggers the workflow in `.github/workflows/deploy.yml` and publishes the site.

Your site URL will be:

```text
https://<your-username>.github.io/<your-repo>/
```

Because the app uses `HashRouter`, in-app routes will work correctly on GitHub Pages.

## Validation

```bash
npm run check
npm run lint
npm run test
npm run build
```
