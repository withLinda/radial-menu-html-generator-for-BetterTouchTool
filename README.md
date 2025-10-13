# Radial Menu HTML Generator for BetterTouchTool

## Overview
This project is a Next.js web application that helps you assemble floating HTML radial menus for [BetterTouchTool](https://folivora.ai/). It provides a guided interface for entering trigger UUIDs, choosing Font Awesome icons, and previewing the menu configuration before exporting reusable HTML. The interface is themed with the Everforest Dark palette so you can focus on assembling your shortcuts without tweaking colors from scratch.

## Key Functions
- **Menu item builder** – Add or remove radial spokes and edit each item's BetterTouchTool UUID, display name, Font Awesome icon, and accent color from a curated preset list or a custom hex value.【F:components/RadialMenuGenerator.tsx†L32-L120】【F:components/RadialMenuGenerator.tsx†L228-L331】
- **Guided icon selection** – Choose from common Font Awesome classes or enter any custom `fa-solid`, `fa-regular`, or `fa-brands` class string, with quick access to the Font Awesome search directory.【F:components/RadialMenuGenerator.tsx†L110-L197】【F:components/RadialMenuGenerator.tsx†L332-L355】
- **Color management** – Blend preset Everforest accents into your menu automatically or provide a custom color picker/hex value that is injected as inline styles when the HTML is generated.【F:components/RadialMenuGenerator.tsx†L40-L71】【F:components/RadialMenuGenerator.tsx†L200-L228】【F:components/RadialMenuGenerator.tsx†L356-L392】
- **One-click HTML generator** – Produce the final floating HTML markup, which includes Font Awesome scripts, BetterTouchTool initialization hooks, and responsive Everforest styling tweaks.【F:components/RadialMenuGenerator.tsx†L72-L227】【F:components/RadialMenuGenerator.tsx†L394-L440】
- **Post-processing tools** – Copy, edit, or download the generated HTML, and consult a summarized list of configured items (with UUID copy buttons) for quick cross-checks while wiring BetterTouchTool actions.【F:components/RadialMenuGenerator.tsx†L441-L557】

## Getting Started

### Prerequisites
- Node.js 18 or later (Next.js 14 requirement)
- npm 9 or later

### Installation
```bash
npm install
```

### Running the development server
```bash
npm run dev
```
This starts Next.js on `http://localhost:3000`. The radial menu generator UI loads immediately because the main page simply renders the `RadialMenuGenerator` component on the client side.【F:app/page.tsx†L1-L5】

### Building for production
```bash
npm run build
npm start
```
`npm run build` creates an optimized Next.js build, and `npm start` serves the compiled app.

## Detailed Usage

1. **Open the generator:** Visit the running development server (or your deployed build). The landing page shows the "Radial Menu Generator" dashboard with Everforest-themed panels.【F:components/RadialMenuGenerator.tsx†L458-L515】
2. **Add menu items:** Click **Add Menu Item** to create new radial spokes. Each panel lets you specify:
   - **UUID** – paste the BetterTouchTool trigger UUID that should fire when the spoke is clicked.【F:components/RadialMenuGenerator.tsx†L467-L488】
   - **Name** – optional label for readability in the summary list.【F:components/RadialMenuGenerator.tsx†L489-L497】
   - **Icon Class** – pick from the preset dropdown or switch to **Custom** and enter any Font Awesome class combination (e.g., `fa-solid fa-house`).【F:components/RadialMenuGenerator.tsx†L498-L536】
   - **Color** – keep a custom hex value with the color picker or choose from the Everforest preset palette; the swatch previews your selection.【F:components/RadialMenuGenerator.tsx†L537-L592】
   - **Remove** – trash icon button deletes the spoke if you no longer need it.【F:components/RadialMenuGenerator.tsx†L593-L603】
3. **Reference more icons:** The tip panel under the form links directly to Font Awesome's search so you can grab class names without leaving the app.【F:components/RadialMenuGenerator.tsx†L604-L615】
4. **Generate the markup:** Press **Generate HTML** to compose the radial menu document. Custom colors are folded into inline styles, Font Awesome is linked, and BetterTouchTool initialization hooks (`BTTInitialize`, `BTTWillCloseWindow`) are inserted automatically.【F:components/RadialMenuGenerator.tsx†L72-L227】【F:components/RadialMenuGenerator.tsx†L616-L638】
5. **Review and export:** The **Generated HTML** card lets you:
   - Copy the full snippet to your clipboard.
   - Toggle **Edit** to make manual tweaks in a textarea and save them back into the generated output.
   - Download the HTML file (`radial-menu.html`) for reuse across machines.【F:components/RadialMenuGenerator.tsx†L639-L706】
6. **Validate entries:** Scroll to **Menu Items Summary** to see a recap of each configured spoke, including a quick UUID copy button for pasting into other BetterTouchTool triggers.【F:components/RadialMenuGenerator.tsx†L707-L742】

## Using the Output in BetterTouchTool
1. Create or select a **Floating HTML Menu** trigger in BetterTouchTool.
2. Paste the generated HTML into the trigger's HTML content box, or point the trigger to the downloaded file.
3. Ensure the referenced UUIDs match existing actions. You can copy them from the summary list while switching between the generator and BetterTouchTool.【F:components/RadialMenuGenerator.tsx†L707-L742】
4. Save the trigger and activate it; the radial menu will animate open automatically thanks to the included `BTTInitialize` script hook.【F:components/RadialMenuGenerator.tsx†L188-L225】

## Customization Tips
- The generator starts with a single sample spoke; add as many as you need and regenerate the HTML to reflect changes.【F:components/RadialMenuGenerator.tsx†L12-L39】【F:components/RadialMenuGenerator.tsx†L616-L638】
- Custom colors that do not match the Everforest presets are injected with dedicated CSS to preserve hover states and drop shadows.【F:components/RadialMenuGenerator.tsx†L72-L167】
- To reuse the same configuration later, keep the downloaded HTML file or store the editable textarea contents in version control.
