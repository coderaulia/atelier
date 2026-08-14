---
name: modern-ui-patterns
description: Standards and patterns for modern UI engineering using Tailwind CSS v4, React 19, accessible design tokens, micro-interactions, and responsive layout primitives.
---

# Modern UI Patterns Guide (Tailwind CSS v4 & React 19)

## Core Principles
1. **CSS-First Design Tokens (Tailwind v4)**: Use `@theme` declarations and native CSS custom properties instead of deprecated `tailwind.config.js`.
2. **React 19 State & Actions**: Leverage React 19 primitives (`useActionState`, `useOptimistic`, and `useTransition`) for seamless asynchronous UI interactions.
3. **Accessibility First (a11y)**: Every modal, dropdown, and tab must support keyboard navigation, ARIA focus management, and meet WCAG AA contrast standards.
4. **Zero Cliché Anti-Patterns**: Avoid purple-on-dark glow, un-tracked large typography, deeply nested card borders, and icon-stuffed bento boxes.

---

## 1. Tailwind CSS v4 Styling Standards

### A. Theme Tokens in `src/index.css`
```css
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;

  --color-brand-primary: hsl(220 90% 56%);
  --color-brand-accent: hsl(25 95% 53%);
  --color-surface-bg: hsl(0 0% 98%);
  --color-surface-card: hsl(0 0% 100%);
  --color-text-main: hsl(220 20% 10%);
  --color-text-muted: hsl(220 10% 45%);
}
```

### B. Fluid Typography & Container Queries
Use container queries `@container` for responsive document/CV preview panels:
```html
<div class="@container w-full">
  <div class="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 gap-4">
    <!-- Fluid Cards -->
  </div>
</div>
```

---

## 2. React 19 Component Best Practices

### A. Form Actions & Optimistic Updates
```typescript
import { useActionState, useOptimistic } from 'react';

export function DocumentTitleEditor({ initialTitle, onSave }: { initialTitle: string; onSave: (title: string) => Promise<void> }) {
  const [optimisticTitle, setOptimisticTitle] = useOptimistic(
    initialTitle,
    (_current, newTitle: string) => newTitle
  );

  const [state, formAction, isPending] = useActionState(async (_prevState: unknown, formData: FormData) => {
    const nextTitle = formData.get('title') as string;
    setOptimisticTitle(nextTitle);
    await onSave(nextTitle);
    return { success: true };
  }, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        type="text"
        name="title"
        defaultValue={optimisticTitle}
        className="px-3 py-1.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        disabled={isPending}
      />
      <button type="submit" disabled={isPending} className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition">
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### B. Dialogs & Modals
Use HTML5 `<dialog>` or native Popover API with backdrop blur:
```html
<dialog id="export-modal" class="p-6 rounded-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm shadow-2xl border border-neutral-200">
  <h2 class="text-xl font-semibold text-neutral-900">Export Options</h2>
  <!-- Content -->
</dialog>
```

---

## 3. Visual & Interaction Checklist
- [ ] Hover and focus states are distinct and provide tactile feedback (scale `98%` on active, soft transitions `150ms ease-out`).
- [ ] Color contrast passes WCAG AA (minimum 4.5:1 for normal text, 3:1 for large text).
- [ ] No layout shift (CLS < 0.1) when images or PDF previews load.
- [ ] Tap targets on mobile screens are at least 44x44px.
