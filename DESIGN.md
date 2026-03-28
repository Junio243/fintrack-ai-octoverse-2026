# Design System: The Ethereal Ledger

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Alchemist"**

This design system transcends the standard utility of financial tracking, moving into the realm of high-end digital horology and atmospheric interface design. We are not building a spreadsheet; we are crafting a "floating sanctuary" for wealth management. 

By marrying the sterile precision of *Minority Report* with the soft, organic warmth of "Dawn Light," the system breaks the traditional rigid grid. We achieve this through **intentional asymmetry**, where data visualizations might overflow their containers, and **layered translucency**, where elements appear to drift in a three-dimensional space rather than sit flat on a screen. Every interaction should feel like touching a polished gemstone or a hand-blown glass lens.

---

## 2. Colors & Atmospheric Lighting
The palette is a study in "High-Key" lighting—relying on whites and pearlescents to create an expansive, premium feel.

### The Palette (Material Design Tokens)
*   **Primary (The Core Glow):** `#2e6385` (Primary) / `#cae7ff` (Container). Used for active holographic states and focus points.
*   **Secondary (Positive Flux):** `#006c52`. A soft mint green used exclusively for growth, profit, and "safe" financial zones.
*   **Tertiary (The Warning):** `#765933`. A light, sophisticated orange for alerts. It is never aggressive, always "advisory."
*   **Neutral (The Atmosphere):** `surface` (`#f8f9fa`) to `surface-container-highest` (`#e1e3e4`). These pearlescent grays define our physical world.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning. 
Structure is defined by **Tonal Transitions**. To separate a sidebar from a main feed, transition from `surface` to `surface-container-low`. To highlight a featured metric, use a `surface-container-lowest` card against a `surface-container` background.

### The Glass & Gradient Rule
All interactive surfaces must utilize **Glassmorphism**. 
*   **Surface:** Use `surface-container-lowest` at 60% opacity.
*   **Effect:** Apply a `backdrop-filter: blur(24px)`.
*   **Glow:** Apply a subtle inner-glow gradient from `primary-fixed` (top-left) to transparent (bottom-right) at 10% opacity to mimic light hitting a beveled glass edge.

---

## 3. Typography: Editorial Etherealism
We use a high-contrast typographic scale to mimic a luxury fashion editorial.

*   **Display & Headline (Newsreader - Serif):** This is our "Signature" voice. Use `display-lg` (3.5rem) for total net worth or primary hero titles. The serif should feel "Custom" and "Handcrafted." Apply a subtle `text-shadow: 0 0 8px rgba(46, 99, 133, 0.15)` to give it an ethereal, backlit glow.
*   **Title & Body (Manrope - Sans):** Our "Instrumental" voice. Manrope provides the technical clarity required for financial data. Use `title-lg` for card headers and `body-md` for transactional data.
*   **Labels (Space Grotesk - Mono-spaced feel):** Use for technical metadata, timestamps, and "holographic" UI elements. This adds the Sci-Fi edge (Blade Runner 2049) to the organic serif.

---

## 4. Elevation, Depth & Hyper-Realism

### The Layering Principle
Depth is achieved by stacking the `surface-container` tiers. 
1.  **Level 0 (Atmosphere):** `surface` (#f8f9fa). The base "sky."
2.  **Level 1 (The Floating Pane):** `surface-container-low`. Softly blurred.
3.  **Level 2 (The Interactive Lens):** `surface-container-lowest`. This is the "brightest" white, used for cards that should feel closest to the user.

### Ambient Shadows
Shadows must not be "dark." Use a tinted shadow based on the `on-surface` color.
*   **Token:** `box-shadow: 0 20px 40px -10px rgba(25, 28, 29, 0.06)`. 
*   **Intent:** It should look like a soft shadow cast by diffused morning sun, not a digital drop-shadow.

### The Ghost Border
If a boundary is required for accessibility in input fields:
*   Use `outline-variant` (`#c2c8c5`) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Handcrafted Interaction

### The "Blown Glass" Card
*   **Background:** `surface-container-lowest` at 70% opacity.
*   **Blur:** 32px.
*   **Edges:** `rounded-xl` (1.5rem).
*   **Padding:** `spacing-6` (2rem) to allow the content to breathe. No dividers. Use `spacing-4` vertical gaps to separate "Transaction Name" from "Amount."

### Buttons (The Hologram)
*   **Primary:** A gradient from `primary` to `primary-fixed-dim`. 
*   **Shape:** `rounded-full`. 
*   **Interaction:** On hover, the "glow" (shadow) should expand, and the opacity should shift from 100% to 90%, making the button feel like a light source being pressed.

### Input Fields (The Etched Lens)
*   **Style:** No background fill. Only a "Ghost Border" at the bottom.
*   **Focus:** The bottom border transitions to `primary` with a 4px soft outer glow.
*   **Label:** Use `label-md` in `spaceGrotesk`, positioned slightly above the field with 0.1em letter spacing.

### Data Visualizations (Organic Fluctuations)
*   Forbid sharp angles in charts. All line graphs must use **Catmull-Rom splines** for organic, "handcrafted" curves.
*   Fill areas under graphs with a `primary-container` to `transparent` vertical gradient.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use white space as a structural element. If a screen feels "empty," it’s likely working.
*   **DO** overlap elements. A floating 3D chart should slightly obscure a background decorative element to establish Z-index.
*   **DO** use `secondary` (Mint) and `tertiary` (Orange) sparingly—only for data status.

### Don't
*   **DON'T** use 100% black text. Use `on-surface` (#191c1d) to maintain the soft "dawn light" aesthetic.
*   **DON'T** use dividers. If you feel the need to separate two items, increase the `spacing` scale or change the `surface-container` tier.
*   **DON'T** use hard corners. Everything in the natural world has a radius; even our "Modern" UI should feel "Organic." Use `rounded-lg` as your absolute minimum.