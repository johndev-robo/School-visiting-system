# Design System Document

## 1. Overview & Creative North Star: "The Academic Estate"
This design system moves away from the generic "dashboard" look to embrace a high-end, editorial aesthetic tailored for the Kenyan educational context. We are building **"The Academic Estate"**—a visual metaphor for an elite boarding school. It combines the unwavering authority of traditional Kenyan institutional excellence (Navy) with the vibrant, forward-looking growth of its students (Forest Green).

The "North Star" of this system is **Sophisticated Stewardship**. We achieve this by rejecting rigid, "boxed-in" grids in favor of intentional asymmetry, layered depth, and expansive white space. The interface should feel like an invitation into a secure, well-managed campus, using tonal shifts and glassmorphism rather than harsh borders to guide the user's eye.

## 2. Colors & Surface Philosophy
The palette is rooted in deep prestige and natural vitality. We use high-contrast tones to ensure clarity for security guards on mobile devices and administrators on desktop.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders (`#74777f`) for sectioning content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit on a `surface` background to create a clean, modern break without visual clutter.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine vellum paper.
- **Base Layer:** `surface` (#faf9fd) or `surface-bright`.
- **Primary Content Area:** Use `surface-container-low` (#f4f3f7) to define the main workspace.
- **High-Focus Elements:** Use `surface-container-lowest` (#ffffff) for the actual cards containing data. This "lifts" the data toward the user naturally.

### The "Glass & Gradient" Rule
To elevate the system above "standard" UI, use Glassmorphism for floating navigation bars or mobile overlays.
- **Glass Effect:** Use `surface` at 70% opacity with a `20px` backdrop blur.
- **Signature Textures:** Apply a subtle linear gradient from `primary` (#000a1e) to `primary_container` (#002147) for hero sections or main CTAs. This creates a "sheen" that communicates premium quality and institutional depth.

---

## 3. Typography: Editorial Authority
We utilize **Inter** to bridge the gap between technical modernism and readable classicism.

*   **Display Scale (The Statement):** Use `display-md` (2.75rem) for main dashboard welcomes. The tight tracking and large scale convey a sense of institutional permanence.
*   **Headline Scale (The Anchor):** `headline-sm` (1.5rem) should be used for section titles. Do not center these; use intentional left-alignment to create an editorial "rag" that feels custom.
*   **Body & Labels (The Detail):** `body-md` (0.875rem) is the workhorse. For mobile security checks, ensure `body-lg` (1rem) is used for student names to prioritize legibility under sunlight.
*   **Tonal Contrast:** Use `on_surface_variant` (#44474e) for secondary metadata to create a "gray-scale" hierarchy that prevents the UI from feeling too heavy.

---

## 4. Elevation & Depth
In this system, depth is a function of light and layering, not "drop shadows."

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-high` background. This creates a crisp, sophisticated lift.
*   **Ambient Shadows:** If a card must float (e.g., a mobile action sheet), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(0, 33, 71, 0.06);`. Notice the tint—we use a fraction of the `primary_container` color, never pure black, to mimic natural light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.
*   **Glassmorphism:** For mobile security "Quick Scans," use semi-transparent `secondary_container` backgrounds with a blur to let the campus environment (the background) bleed through, making the tool feel like an integrated part of the environment.

---

## 5. Components & Interface Patterns

### Cards & Lists (The Core)
*   **Prohibition:** Never use divider lines. 
*   **Alternative:** Use `1.5` (0.375rem) or `2` (0.5rem) vertical spacing from the scale to separate list items. 
*   **Card Style:** Use `xl` (0.75rem) roundedness for a modern, approachable feel. Each card should feature a subtle 2px left-accent bar in `primary` or `secondary` to denote status.

### Status Indicators (The "Authority" Chips)
Status must be unmistakable for fast-paced security environments:
*   **Approved:** `secondary_container` (#8ff780) background with `on_secondary_container` (#00730d) text. Use a checkmark icon.
*   **Pending:** `tertiary_container` (#cca800) background with `on_tertiary_container` (#4d3e00) text.
*   **Declined:** `error_container` (#ffdad6) background with `on_error_container` (#93000a) text.

### Buttons
*   **Primary Action:** A gradient fill from `primary` to `primary_container`. High-contrast `on_primary` (#ffffff) text. Use `lg` (0.5rem) roundedness.
*   **Secondary/Action:** `secondary` (#006e0c) text on a `surface-container-high` background. This conveys "Growth/Success" without competing with the "Authority" of the primary button.

### Input Fields
*   Use a "Filled" style with `surface_container_highest` background. Remove the bottom border in favor of a 2px `primary` indicator that only appears on focus. This reduces visual noise on complex administrative forms.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Place student photos slightly off-center or overlapping card boundaries to break the "template" feel.
*   **Prioritize Breathing Room:** Use the `8` (2rem) and `10` (2.5rem) spacing tokens between major content blocks.
*   **Contextual Sizing:** Use `display-sm` for desktop stats, but switch to `title-lg` for mobile to ensure the card fits the viewport.

### Don't:
*   **Don't use 1px solid borders.** This is the quickest way to make the system look "cheap" or "out-of-the-box."
*   **Don't use pure black shadows.** Always tint shadows with the `primary` navy color to maintain a premium, cohesive look.
*   **Don't crowd the screen.** If an administrative table is too complex, use nested `surface-container` tiers to group data instead of adding more lines.
*   **Don't use Forest Green for "Warning" states.** Use the `tertiary` (Gold/Yellow) tokens for warnings; Green is strictly for "Growth" and "Approved" states.