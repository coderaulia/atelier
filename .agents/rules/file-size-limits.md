---
trigger: always_on
---

# Code File Size Limits

- **Maximum File Length**: Every code file produced or modified must **NOT** exceed **800–1,000 lines of code**.
- **Proactive Decomposition**: When any file approaches or exceeds this threshold, you must decompose it into focused, modular chunks:
  - Extract reusable sub-components, templates, or view layers into dedicated sub-files.
  - Extract state machines, business workflows, and API calls into custom hooks or helper modules.
  - Decompose monolithic route handlers into discrete domain controllers and service functions.
  - Separate large data schemas and interfaces into domain-specific `types.ts` files.
- **Single Responsibility Principle**: Ensure each file retains a single, well-defined responsibility with cohesive logic and explicit export boundaries.
- **Backward Compatibility**: When modularizing existing files, use clean re-exports or barrel files (`index.ts`) to avoid breaking existing import paths.
