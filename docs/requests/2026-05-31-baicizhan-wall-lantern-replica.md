# 2026-05-31 Baicizhan Wall Lantern 1:1 Replica Request

## Background
The user provided a screenshot of the "Desk Mate Space" (同桌空间) wall with a red circle and arrow pointing to an elegant hanging traditional Chinese palace lantern. They requested this lantern to be implemented as a pixel-perfect 1:1 vector replica on the wall.

## Requirements
- Replicate the blue-gold palace lantern 1:1 with high-fidelity vector styling.
- Place it in the correct wall hanging slot (`wall_hanging`) with key `wall_lantern` in `AvatarRenderer.tsx`.
- Correctly position it at `translate(370, 100)`, hanging down between the clock on the left (`x=250`) and the calendar board on the right (`x=650`).
- Define premium gradients for:
  - **Gold Filigree:** `#goldGrad` (metallic linear gradient)
  - **Blue Glowing Glass Core:** `#blueLanternGrad` (radial blue-to-cyan gradient)
  - **Inner Glow:** `#lanternInnerGlow` (radial soft white-to-blue glow)
  - **Silken Tassel:** `#tasselGrad` (linear cyan-to-darkteal gradient)
- Update `ItemPreview` to render it correctly inside the closet/shop grid under the "墙饰" (Wall Hanging) tab.
- Maintain green status on type checking and Vitest suites.

## Implementation Details

### 1. Vector Composition & Structure
The palace lantern consists of:
- **Hanging Chain:** Vertical line (`strokeWidth="2.5"`) with gold link rings.
- **Lantern Crown (Roof):** Traditional upswept eaves using overlapping gold cubic bezier curves, capped with a green jade bead.
- **Hanging Beads:** Left and right dashed chains holding jade droplets and blue silk threads hanging down from the eave tips.
- **Glass Core:** Glowing blue-to-cyan radial capsule surrounded by five gold vertical wire guards.
- **Base Cap & Tassel:** Standard gold bell cup holding a green jade donut, finished with a long, elegant multi-layered cyan tassel.

### 2. Standalone Shop Previews (`ItemPreview` inside `AvatarRenderer.tsx`)
- Extended `ItemPreview` to support the `'wall_hanging'` slotType.
- Embedded self-contained gradient definitions directly inside the preview so they render beautifully in both single avatar dress-up and environment dress-up modes.
- Scaled `wall_lantern` by `0.35` and shifted by `translate(0, -150)` to center it perfectly inside a compact `120x120` preview box.

## Verification
- Ran TypeScript compile check (`npx tsc --noEmit`): **Passed with 0 errors**.
- Ran Vitest suite (`npx vitest run`): **Passed with 205/205 tests green**.
