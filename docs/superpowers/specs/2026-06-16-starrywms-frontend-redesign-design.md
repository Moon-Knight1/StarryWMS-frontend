# StarryWMS Frontend Redesign Design

## Context

`StarryWMS-frontend` is a Vue 3, TypeScript, Vite, Element Plus frontend based on the RuoYi admin shell. The current UI still reads as the default RuoYi interface: standard login card, generic framework home page, blue active states, and a basic dark sidebar.

`RuoYi-frontend` in the same workspace already explores a StarryWMS direction: dark navigation, amber highlights, star-chart login visuals, a custom logo, and a more atmospheric admin shell. This redesign will use that project as the visual reference, while tightening it into a practical WMS operations console.

## Goal

Redesign the StarryWMS frontend shell and home screen so the first impression is a warehouse operations platform instead of a generic RuoYi framework demo.

The target experience is a dark, precise, operational console:

- Star-map identity for the StarryWMS brand.
- High-density WMS dashboard content for daily work.
- Clear navigation and form usability over decorative effects.
- No backend contract changes.

## Scope

In scope:

- Redesign `src/views/login.vue`.
- Redesign `src/views/index.vue`.
- Restyle `src/layout/components/Navbar.vue`.
- Restyle `src/layout/components/Sidebar/Logo.vue`.
- Update global visual tokens in `src/assets/styles/variables.module.scss`.
- Update sidebar behavior and active states in `src/assets/styles/sidebar.scss`.
- Update global font and base layout rules in `src/assets/styles/index.scss`.
- Add `src/assets/styles/theme-dark-global.scss` and import it from `src/main.ts` only if shared Element Plus dark styling needs a separate layer.

Out of scope:

- Route definitions.
- Permission logic.
- API clients.
- Business page data logic.
- WMS module CRUD pages.
- Backend integration for dashboard metrics.

## Visual System

Palette:

- `midnight`: `#0c1018` for the app shell and sidebar.
- `panel`: `#141c26` for cards and overlays.
- `amber`: `#c8956c` for active navigation, primary accents, and current-task emphasis.
- `ice`: `#7aaccc` for system health and online state.
- `steel`: `#8a9aaa` for secondary text and inactive menu items.
- `mist`: `#dce4ec` for primary readable text.

Typography:

- Body: system sans stack with `Noto Sans SC` fallback.
- Display or brand text: serif fallback stack used sparingly for StarryWMS identity.
- Data labels: compact sans or monospace fallback where appropriate.

Shape and spacing:

- Keep cards and controls at small radii, no large rounded marketing cards.
- Use thin borders and subdued backgrounds instead of heavy shadows.
- Preserve admin density: dashboards should scan quickly and not feel like a landing page.

Signature element:

- A restrained star-chart motif appears on login and select dashboard accents.
- The motif must not obscure form fields, table content, or operational status.

## Page Design

### Login

The login page becomes a StarryWMS access screen:

- Full-screen midnight background.
- Lightweight star canvas or CSS star field.
- Star-chart linework as a low-opacity background layer.
- Brand panel with `StarryWMS` and WMS positioning.
- Login panel with username, password, captcha, remember password, and submit action.
- Existing `handleLogin`, `getCode`, cookie, captcha, and redirect logic remains intact.

Reduced-motion behavior:

- If `prefers-reduced-motion` is enabled, disable or greatly reduce star animation.
- On narrow mobile screens, simplify background effects and stack content vertically.

### Home Dashboard

The default RuoYi introduction page is replaced by a WMS dashboard:

- Top operating summary: inbound today, outbound today, inventory warning, device online.
- Quick business entries: inbound, outbound, inventory, wave, shipment, IoT.
- Task flow: pending putaway, pending picking, exception handling, recent notices.
- A compact status strip or timeline for warehouse work rhythm.

Dashboard metrics use local static arrays for now. Future backend integration should only replace the data source, not the layout contract.

## Layout Components

### Sidebar

The sidebar follows the reference project direction:

- Width increases slightly to support WMS menu names.
- Dark background with thin amber edge accent.
- Active menu uses a left amber rail plus muted amber fill.
- Hover states use low-opacity amber or blue-gray, not bright blue.
- Collapsed mode keeps icon alignment stable.

### Logo

Use the available StarryWMS logo if present. If only the current logo exists, keep the asset and restyle its size, spacing, and text treatment.

Expanded mode shows logo and title. Collapsed mode shows only the mark.

### Navbar

The top bar becomes a dark translucent command bar:

- Hamburger, breadcrumb, search, docs/source links, fullscreen, theme switch, size, notices, and user menu remain.
- Right-side icons use equal hit areas.
- Avatar receives a subtle ring treatment.
- Dropdown menu uses dark background and clear hover states.

## Data Flow

No new data flow is introduced.

- Login uses existing store and API behavior.
- Dashboard uses local static data arrays in `src/views/index.vue`.
- Navigation uses existing settings, app, user, and lock stores.
- Theme switch continues to use the existing settings store.

## Error Handling

- Login validation remains Element Plus form validation.
- Captcha reload behavior remains unchanged after failed login.
- If canvas is unavailable, login still renders a static background and usable form.
- If view transition is unsupported for theme switch, fall back to immediate theme toggle.

## Testing And Verification

Required checks:

- `npm run build:prod` passes.
- Login page renders and form controls remain usable.
- Home dashboard renders without console runtime errors.
- Sidebar expanded, collapsed, and mobile states remain usable.
- Navbar dropdown, theme switch, fullscreen, search, and notice entry remain accessible.
- Existing business routes are not modified by the redesign.

Manual visual checks:

- No text overlaps in desktop or mobile widths.
- Login form remains readable over background effects.
- Dashboard reads as an operations console, not a marketing page.
- Accent color is used for task priority and navigation, not everywhere.

## Implementation Notes

Keep edits close to the files listed in scope. Do not refactor stores, router, API clients, or business modules.

Where `RuoYi-frontend` has useful visual patterns, adapt them to TypeScript and the existing import style in `StarryWMS-frontend` instead of copying JavaScript files directly.

The existing modified `auto-imports.d.ts` is unrelated to the redesign and should not be reverted.
