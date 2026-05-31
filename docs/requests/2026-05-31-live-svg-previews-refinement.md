# 2026-05-31 Live SVG Previews Refinement Request

## Background
During a comprehensive audit of the implemented 64 desk ornaments and 21 desk accessories, we noticed that in the shop/closet grid (`ShopAndCloset.tsx`), items were previously represented only by their `imageKey` strings (e.g., `orn_fox`). To align with the strict "copied 1:1 from Baicizhan" and "make sure all the things you made is good" requirements, we introduced a premium enhancement: **live SVG preview rendering** directly inside the shop grid slots.

## Requirements
- Introduce an `ItemPreview` component in `AvatarRenderer.tsx` that exports standalone, perfectly scaled, and centered SVG representations of specific slot types and item keys.
- Integrate the `ItemPreview` component inside the shop grid in `ShopAndCloset.tsx` to replace raw text tags with gorgeous live graphics.
- Ensure all SVG centering offsets are mathematically cancelled out (such as the `(150, 380)` offset for desk ornaments and `(-10, 360)` for desk accessories) so they display correctly inside a compact `120x120` bounding box.
- Maintain complete type safety and ensure all unit tests remain fully green.

## Implementation Details

### 1. Standalone Previews (`AvatarRenderer.tsx`)
Added `ItemPreview` which extracts individual vector components and translates them to origin `(0,0)`, scales them to fit the preview thumbnail, and renders them inside a standard `<svg>` container.
- **Slot `body`:** Centered using `transform="translate(60, 60) scale(0.3) translate(-150, -300)"`.
- **Slot `hair`:** Centered using `transform="translate(60, 60) scale(0.35) translate(-150, -140)"`.
- **Slot `hat`:** Centered using `transform="translate(60, 60) scale(0.4) translate(-150, -80)"`.
- **Slot `face`:** Centered using `transform="translate(60, 60) scale(0.5) translate(-150, -115)"`.
- **Slot `desk_acc`:** Centered by cancelling internal offset with `translate(10, -360)` and scaling with `transform="translate(60, 60) scale(0.9) translate(-80, -60)"`.
- **Slot `desk_ornament`:** Centered by cancelling internal offset with `translate(-150, -380)` and scaling with `transform="translate(60, 60) scale(0.65) translate(-55, -70)"`.

### 2. Shop Grid Integration (`ShopAndCloset.tsx`)
- Imported `ItemPreview` from `./AvatarRenderer`.
- Swapped the old `item.imageKey` text block with `<ItemPreview slotType={item.slotType} imageKey={item.imageKey} size={80} />`.

## Verification
- Ran TypeScript compilation check (`npx tsc --noEmit`): **Passed cleanly with 0 errors**.
- Ran Vitest suite (`npx vitest run`): **Passed cleanly with 205/205 green tests**.
