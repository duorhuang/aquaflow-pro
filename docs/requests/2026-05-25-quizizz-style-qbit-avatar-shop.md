# Request: Quizizz-Style Qbit Avatar Shop & Wardrobe Replay

## Date
2026-05-25

## Description
The user wants to completely overhaul the player-end avatar development, wardrobe, and shop system to **1:1 replicate the Quizizz "Qbit" avatar shop feature**. 

The new layout will be a highly premium, dark-themed, split-pane dashboard that visualizes the player avatar on a glowing, spotlight-illuminated stage alongside a categorized customization panel.

### Key Visual & Functional Replicas

1. **Top Dashboard Bar**:
   - **Swimmer Name**: Displays the active athlete's name on the left (e.g. "Yizi").
   - **Spendable Currency (XP)**: A custom-designed gold badge featuring a golden coin icon, the athlete's XP balance, and a gold "+" action button (which triggers a prompt guiding them on how to earn more XP).
   - **Close Action**: A clean "X" exit button in the top-right to navigate back to the workout dashboard.

2. **Left Panel: Categorized Customization & Shop**:
   - **Notification Banner**: A clean, themed banner at the top of the panel (e.g. `"Summer Drop is live. Ends May 31."` or `"水下极限竞速季正在进行 · 5月31日截止"`).
   - **Icon-Driven Tab Navigation**: Premium horizontal tab bar featuring icons from Quizizz:
     - **Presets & Events** (Lucide `Sparkles` or `Flame`): For premium skins / base characters.
     - **Seasonal Drops** (Lucide `Sun`): Summer/Seasonal limited items.
     - **Skin Tones & Expressions** (Lucide `Smile`): Custom skin blocks and faces.
     - **Haircuts** (Lucide `Scissors` or `Brush`): Hair adjustments.
     - **Headwear** (Lucide `Moon` or custom cap): Swim caps and hats.
     - **Tops / Swimsuits** (Lucide `Shirt`): Outer wear.
     - **Bottoms** (Lucide `Layers` or `User`): Swim trunks and pants.
     - **Accessories & Handhelds** (Lucide `Wand2`): Kickboards, watches, etc.
   - **Interactive Grid Cards**:
     - **Visual Preview**: Render the individual item inside a mini 2.5D SVG canvas.
     - **Rarity Badges**: Floating rarity tag at the top (`Legendary` in gold, `Rare` in purple, `Common` in blue/slate).
     - **Currency Pill**: Golden price pill displaying `⚡ [Price] XP` or a coin emblem.
     - **Status Display**: Clean indicator for `已购/已拥有` (Owned) or `立即兑换` (Redeem).

3. **Right Panel: Spotlight Pedestal Stage**:
   - **3D Pedestal**: A cylindrical stage with vertical lighting gradients, reflective metallic border highlights, and a deep radial shadow under it.
   - **Dynamic Spotlight**: A dramatic light cone filtering down onto the pedestal from the top, represented by clip-paths, soft white gradients, and ambient blur filters.
   - **Avatar Preview**: The avatar stands breathing and floating on the pedestal, dynamically reflecting all equipped items.
   - **Interactive Side Actions**:
     - **Download/Export button**: Render the SVG canvas and trigger a download of the swimmer's custom avatar.
     - **Dice / Randomize button**: Randomize equipped items from the swimmer's unlocked/owned closet collection for a fun, playful experience.
   - **Confirm Button**: A prominent, bold white rounded button at the bottom of the stage saying `"Save my Swimmer" / "保存我的小人"`.

4. **Premium Dark Aesthetics**:
   - Curated dark gradients (`#09090b` to `#18181b` backdrop) with amber and gold glowing highlights.
   - Fluid transitions, micro-animations, and typography.

## Status
In Planning Phase. Awaiting implementation design approval.
