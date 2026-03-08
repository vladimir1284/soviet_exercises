# Gemini Code Generation Guidelines

These guidelines are meant to ensure that any newly generated code is consistent with the `sovietfit` project's architecture, style, and conventions.

## 1. Tech Stack & Architecture
- **Framework:** SvelteKit 2 with TypeScript.
- **Styling:** Tailwind CSS.
- **Database:** Cloudflare D1 (SQLite).
- **Authentication:** Clerk (`@clerk/clerk-js`).
- **Hosting/Adapter:** Cloudflare Pages (`@sveltejs/adapter-cloudflare`).
- **Internationalization:** `svelte-i18n`.

## 2. Component structure & Svelte Conventions
- Always use `<script lang="ts">` for TypeScript definitions.
- Keep components modular and reusable in `src/lib/components`.
- Rely on standard Svelte features like `$:` for reactivity, transitions (`fade`, `fly`), and `createEventDispatcher` for component events.
- Path aliases: Use `$components`, `$stores`, `$i18n`, and `$db` for easier imports.

## 3. Styling & Tailwind CSS
- **Theme Colors:** Use the defined `surface` color scale (e.g., `bg-surface-100`, `text-surface-900`) and the `accent` color (e.g., `text-accent`, `bg-accent`).
- **Dark Mode:** The project uses class-based dark mode (`dark:`). Ensure every applied color has a corresponding dark mode fallback (e.g., `bg-white dark:bg-surface-100`).
- **UI Elements:** Stick to the custom utility classes defined in the project (e.g., `btn`, `btn-primary`, `input`, `input-bordered`) instead of recreating them from scratch or adding new UI libraries.
- **Icons:** Use inline SVGs for icons. Use `currentColor` for strokes or fills to inherit text color.

## 4. Internationalization (i18n)
- **NEVER hardcode text** in the UI.
- Use `svelte-i18n`. Import the store (`import { _ } from 'svelte-i18n'`) and use it in templates as `{$_('namespace.key')}`.

## 5. Accessibility (a11y) & UX
- Provide semantic HTML elements whenever possible.
- Include proper ARIA attributes (e.g., `aria-label`, `role="dialog"`, `aria-hidden`) for interactive elements and modals.
- Handle keyboard navigation (e.g., escaping out of modals, submitting forms with the Enter key).
- Provide loading states (e.g., `<span class="loading loading-spinner">`) and disable buttons while submittions are in progress.
- Include graceful error boundaries or inline error messages (e.g., auth errors).

## 6. Database & State
- **Database:** Interact with Cloudflare D1 via the models and queries located in `src/lib/db`. Ensure queries are compatible with SQLite.
- **Stores:** Use Svelte stores for global state (e.g., `$user`, `$isOnline` from `src/lib/stores`).
