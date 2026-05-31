# 2026-05-30 Double-Check and 1:1 Replica Enhancements

## Background

The user requested a thorough verification of the gamification and classroom scene elements to ensure absolutely perfect alignment with the Baicizhan (百词斩) "Study Mate" system, fixing any remaining bugs, and preparing to support additional items from upcoming screenshots.

## Identified Issues and Requirements

During our exhaustive code review, we discovered the following critical gaps and bugs:

1. **Incorrect Save API Call**: `ShopAndCloset.tsx` was calling `PATCH /api/swimmers/${swimmerId}`, which is not defined in the backend and causes a `404 Not Found` error. It should instead call `POST /api/shop` with `action: 'equip'`.
2. **Equipped State Mismatch (ID vs. ImageKey)**: 
   - `previewEquipped` was storing item `id` (UUIDs) upon user click.
   - `AvatarRenderer.tsx` and the database `Swimmer.equippedItems` expect `imageKey` strings (e.g. `'clothes_ruiyun'`).
   - `isEquipped` was comparing `imageKey` string against `item.id`.
   - This mismatch broke rendering of equipped items, display checkmarks, and saving.
3. **No Card Click Handler to Equip/Preview**: Owned items could not be equipped because there was no click handler on the item card itself.
4. **Closet Navigation Loop**: The `ChevronLeft` and `ChevronDown` back buttons inside `ShopAndCloset.tsx` did not have click handlers, locking the user in the wardrobe and preventing return to the profile edit screen.
5. **Zoomed Profile Picture Quality**: Small avatars (`size < 200` in the top bar, buddy list, and roster search) were rendering the full desk, hands, paper, pen, and accessories in a tiny space, causing a cluttered, aesthetically unpleasing look.
6. **No Toggle-to-Unequip**: Clicking an already equipped optional cosmetic item in the drawer did not toggle it off, which differs from Baicizhan's smooth toggle behaviors.

## Action Plan

1. **Fix `ShopAndCloset.tsx` state management**:
   - Change `previewEquipped` to consistently map `slotType` to `item.imageKey`.
   - Add card `onClick` to call `handleEquip(item)` for instant previews and equipping.
   - Correctly construct the `{ id, imageKey }` payload in `handleSave` and post it to `POST /api/shop` with `action: 'equip'`.
2. **Support Wardrobe Exit (`onClose`)**:
   - Add an `onClose?: () => void` prop to `ShopAndCloset`.
   - Bind `onClose` to the `ChevronLeft` header back-button and the `ChevronDown` action overlay button.
   - Pass `onClose={() => setActiveTab('profile')}` in `app/(athlete)/profile/page.tsx` so the back actions smoothly unmount the closet and return the user to the profile.
3. **Dynamic Zoomed Profile rendering in `AvatarRenderer.tsx`**:
   - Detect when `mode === "single"` and `size < 200`.
   - Shift the SVG `viewBox` from the full `0 0 600 800` (aspect `3:4`) to a zoomed `100 100 400 400` (aspect `1:1`).
   - This perfectly crops out the desk, paper, pencil, crystal bowl, and hands, displaying a gorgeous, clean, close-up face/hair/outfit avatar image inside circular profile indicators and roster cards.
4. **Cosmetic Toggle-to-Unequip**:
   - Refactor `handleEquip(item)` in `ShopAndCloset` to toggle off optional items (e.g. hats, face items, ornaments, plants) upon re-clicking their cards.
5. **Verify All Systems**:
   - Run typescript compilation (`npx tsc --noEmit`) and unit tests (`npx vitest run`) to confirm perfect system stability.
