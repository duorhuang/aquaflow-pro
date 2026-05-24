# Request: Premium 2.5D Swimwear & Accessories Refinement (高品质2.5D立体泳装装备精细化)

## Date
2026-05-24

## Description
The user expressed dissatisfaction with the simplistic shapes of the equipped swim accessories, noting that the swim caps looked like plain flat semicircles and the fins/slippers/kickboards looked like flat basic triangles or rectangles.

The user wants all closet swim accessories to be made **extremely premium, detailed, 2.5D, textured, and custom-tailored**:
- **Swim Caps (`head_universal_cap`)**: Remodel as a snug silicone racing cap custom-fit for each of the 6 characters, featuring 3D volume gradients, high-gloss white specular reflection curves, a sporty wave logo print, and stretch wrinkles/seams at the temples.
- **Swim Goggles (`eyes_universal_goggles`)**: Upgrade into high-fidelity ergonomic double-rimmed frames with a raised nose bridge connection, diagonal anti-fog specular lens reflections, and side strap buckle details.
- **Slippers/Slides (`feet_universal_slippers`)**: Upgrade from flat rectangles to 3D molded sport slides with a defined footbed cushion layer, double athletic strap bands (blue and white), and outsole shading.
- **Kickboards (`hand_universal_kickboard`)**: Upgrade from a flat rounded rect to a 3.5D professional foam board with realistic side thickness extrusion, dual ergonomic cutout grip handles, premium wave logo prints, and top highlight layers.

## Resolution Plan
1. **Fix AvatarRenderer.tsx Syntax Bug**: Resolve the truncated, broken `head_universal_cap` case block that was left with a syntax error (`return (` followed by commented JSX and missing braces) in the previous edit.
2. **Re-Architect Universal Swimwear Assets**:
   - Write highly detailed multi-layered SVG assets inside `AvatarRenderer.tsx` for all universal swim slots (`head_universal_cap`, `eyes_universal_goggles`, `feet_universal_slippers`, `hand_universal_kickboard`).
   - Use HSL gradients, precise coordinates for each of the 6 bases, and white specular highlight paths (`opacity="0.45" fill="#fff"`) to represent glossy reflections.
3. **Verify Build Health**: Perform a complete Next.js typescript compilation check to ensure the file parses correctly and the site compiles cleanly.
