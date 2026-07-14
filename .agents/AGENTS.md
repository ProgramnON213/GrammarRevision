# Project Rules: Grammar Revision Workbook

This project is a web-based grammar practice workbook allowing teachers and students to practice English grammar using custom JSON question banks.

## Tech Stack
- **Frontend Core**: React 18, TypeScript 5, Vite 6, Zustand 5 (state management), React Router DOM 7 (`HashRouter`).
- **Styling**: Tailwind CSS 3 (configured with PostCSS and autoprefixer).
- **Icons**: Lucide React.
- **Testing**: Vitest for unit testing.

## Commands
All commands should be executed from the `workspace/` directory:
- **Install dependencies**: `npm install`
- **Development server**: `npm run dev`
- **Production build**: `npm run build` (runs typescript check and vite build)
- **Linting**: `npm run lint` (uses ESLint 9)
- **Type checking**: `npm run check` (runs `tsc -b --noEmit`)
- **Run tests**: `npm run test`
- **Watch tests**: `npm run test:watch`

## Code Conventions
- **Component Styling**: Colocate components and their styles. Use `cn()` utility from `@/lib/utils` for conditional Tailwind classNames.
- **Routing**: Always use `HashRouter` from `react-router-dom` to ensure clean navigation compatibility with static hostings like GitHub Pages.
- **Component Architecture**: 
  - Store reusable UI primitives (like buttons, inputs, pills, cards) in `workspace/src/components/ui/`.
  - Store pages (main view containers) in `workspace/src/pages/`.
  - Colocate logic in custom hooks or Zustand stores inside `workspace/src/stores/useGrammarStore.ts`.
- **JSON Data Structure**: 
  All question files in `workspace/src/data/` and `exercise/` must be arrays of objects conforming to the `Question` type:
  ```json
  [
    {
      "category": "Tenses",
      "subcategory": "Past Simple",
      "question": "We _____ (play) soccer yesterday.",
      "options": ["play", "played", "playing", "plays"],
      "correctAnswer": "played",
      "explanation": "For regular verbs in the Past Simple, we add '-ed' to the end of the base verb."
    }
  ]
  ```
