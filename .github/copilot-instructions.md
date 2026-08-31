# GitHub Copilot / Cursor Custom Instructions

## 🌐 Project Context & Architecture

- **Framework:** Ionic Framework with Angular (Latest version utilizing Signals and Native Control Flow).
- **Platform Targets:** Dual-target hybrid codebase: Mobile app (via Capacitor) and Web app (via Docker/Nginx container).
- **Directory Layout:**
  - `src/app/core/`: Globally isolated system brain (guards, interceptors, global services).
  - `src/app/shared/`: Globally reusable elements (components, pipes, directives, interfaces, utils).
  - `src/app/shared/layouts/`: Shell navigation wrappers (`mobile-layout` with `<ion-menu>`, `web-layout` with sidebar).
  - `src/app/views/`: Domain feature roots (for example `auth`, `clients`) with routes and feature-specific components.

## 🏗️ Dual-UI Design Pattern (Smart/Dumb Split)

Every major page view within the `views/` folder must follow this exact architectural pattern:

1. **One Smart Parent Component** (e.g., `login.component.ts`): Handles all lifecycle logic, API integrations, error handling, configuration injection, and state management. It controls which visual view to display based on the environment platform context.
2. **Two Dumb Presentation Components** (e.g., `login-mobile.component.ts` and `login-web.component.ts`): Contain ONLY the isolated platform-specific HTML/SCSS presentation layer. They accept data via `input()` and bubble user interactions up via `output()`.

## 🛠️ Hybrid Platform Core Rules

- **Configuration Management:** Never hardcode API, backend, or cloud server URLs. Always resolve URLs dynamically at runtime via our custom `ConfigService` which reads from the root-level `/config.json` file.
- **Data Storage:** Never use browser `localStorage` directly in feature blocks or services. Always route storage operations through our unified, async `StorageService` wrapped around `@capacitor/preferences` to seamlessly support both native device sandboxes and web browsers.

## 📐 TypeScript Best Practices

- Use strict type checking globally.
- Prefer explicit type inference when the type is obvious.
- Strictly avoid the `any` type; use `unknown` when a data type is uncertain or dynamic.

## 🆎 Angular Component & Template Rules

- **Standalone:** Always use standalone components over NgModules. Do NOT set `standalone: true` inside Angular decorators as it is the default.
- **State:** Use Angular Signals (`signal()`) for component local state management. Use `computed()` for derived states. Do NOT use `mutate` on signals; use `update` or `set` instead.
- **Inputs/Outputs:** Use modern `input()` and `output()` functions instead of old `@Input` or `@Output` decorators.
- **Optimization:** Set `changeDetection: ChangeDetectionStrategy.OnPush` in every `@Component` decorator.
- **Bindings & Selectors:** Do NOT use `ngClass` or `ngStyle`. Use native `class` and `style` bindings instead. Do NOT use `@HostBinding` or `@HostListener` decorators; declare host bindings inside the `host` object of the component decorator.
- **Feature Placement:** Always place route features in `src/app/views/<domain>/`.
- **Component File Structure:** Never generate inline templates or inline styles. Always generate exactly 3 component files: `.ts`, `.html`, and `.scss`.
- **Decorator Conventions:** Every `@Component` decorator must use `templateUrl` and `styleUrl` pointing to external files.
- **Templates & Images:** Use native control flow (`@if`, `@for`, `@switch`) instead of legacy structural directives (`*ngIf`, `*ngFor`). Use `NgOptimizedImage` for static images (note: it does not work for base64 strings).
- **Forms:** Prefer explicit Reactive Forms instead of Template-driven ones.

## 🧬 Angular Services & Pipes

- Design every service around a single, clean responsibility.
- Use the `providedIn: 'root'` option for singleton global services.
- Always use the functional `inject()` mechanism instead of constructor dependency injection.
- Use the `async` pipe to handle and automatically clean up Observables within templates.

## 🤖 Token-Saving & Response Behavior

- Be highly concise. Omit conversational filler.
- Provide targeted code snippets, component modifications, or git diffs rather than reprinting entire unmodified files.
- Deeply analyze existing open file tabs in the workspace before writing code to prevent broken imports, duplicate patterns, or fractured logic paths.
