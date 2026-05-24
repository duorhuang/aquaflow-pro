# Request: Manga-Style Hand-Drawn Avatar Refinement (一笔一画手绘漫画感)

## Date
2026-05-24

## Description
The user expressed strong dissatisfaction with the current character styling, describing it as "still so ugly" and criticizing it for being composed of "simple geometric shapes" (e.g., plain rectangles, circles, ellipses). 

The user wants the 2D avatars to look like **authentic hand-drawn manga illustrations (一笔一画手绘漫画感)** that are extremely faithful to the original animated works:
- **No simple primitive shapes** (no plain circles, ellipses, or boxes for faces, clothes, hair, or features).
- **Realistic hand-drawn feeling** with organic strokes, manga line weights, expressive contours, clothing folds, printed-style shading, and highly accurate character proportions.
- **Extreme faithfulness to the original designs** of the 6 characters:
  1. **蜡笔小新 (Shin-chan)**: Asymmetric organic potato face, iconic messy thick eyebrows, hand-drawn open mouth with tongue, wrinkled red t-shirt, organic chubby limbs.
  2. **小黄人 (Minion)**: Organic capsule silhouette, supporting **both single-eye (1-eyed, e.g., Stuart) and double-eye (2-eyed, e.g., Kevin/Dave) styles** based on equipped goggles/closet settings. Includes sketchy denim overalls with stitches and pocket logo, high-fidelity goggles with metal rivets, spiky hand-drawn hairs, and three-fingered gloves.
  3. **光头强 (Logger Vick)**: Completely replace the cartoon duck/frog shape with a **100% authentic, hand-drawn vector model of the real Logger Vick, precisely matching the official reference image**:
     - **Orange Construction Helmet (经典安全帽)**: Bright orange safety helmet with high-fidelity shading gradients, a curved sun brim, and a small green/yellow logo patch in the center.
     - **Bulging Wide-Open Eyes**: Big, close-set bulging comic eyes with tiny black pupils, expressing wide-eyed mischief, topped with highly arched thin black eyebrows.
     - **Flesh Bulbous Nose**: Large, wide flesh-toned pear-shaped nose overlapping the eyes slightly, featuring organic lighting and highlights.
     - **Giant Open Laughing Mouth**: Enormously wide comic grin showing two complete rows of white cartoon teeth, a pink tongue, and dark red mouth cavity.
     - **Thin Pencil Mustache & Stubble**: High-fidelity thin black mustache sitting just above the mouth, accompanied by a clean blue-grey jawline stubble shadow (`#94a3b8`).
     - **Lumberjack Vest with Fur Trim**: Warm brown woodcutter vest with thick, fluffy cream-colored fur lining (`#fdf6e2`) along all open edges and collar, worn over a dark navy shirt.
  4. **猪猪侠 (GG Bond)**: Completely replace the generic pig with a **100% authentic, hand-drawn vector model of the real GG Bond, precisely matching the official reference image**:
     - **Chubby Peach Face & Pig Ears**: Extra chubby, round baby pink face with prominent, floppy pink pig ears on the sides.
     - **Classic Red & Yellow Hero Helmet**: Signature red helmet covering his head, featuring a thick red padded roll on the forehead and **two large yellow round goggles/eyes** on top.
     - **Wide Oval Snout & Grin**: Giant, horizontal pink pig snout in the center with two distinct vertical oval nostrils, resting above a mischievous, toothy comic smirk.
     - **Sparkling Brown Eye & Winking Pose**: An incredibly cute eye setup: his right eye is **winked shut** in a happy curved line, while his left eye is **wide open and sparkling** with a rich brown/hazel iris and multiple white specular reflection points.
     - **Red Battle Suit with Golden Crest**: Bright red superhero suit with a **large golden oval emblem** on the belly containing his signature "00" logo slits, paired with shiny gold-plated gloves and boots.
  5. **柯南 (Conan)**: Completely replace the generic boy with a **100% authentic, hand-drawn vector model of the real Conan, precisely matching the official reference image**:
     - **Pointy Anime Face & Large Ears**: A sharp, pointy V-shaped anime jawline with large, detailed cartoon ears.
     - **Pointy Layered Anime Hair (经典刺猬碎发)**: Beautiful dark brown spiky hair with multiple detailed pointy bangs falling over his forehead and framing his face, and his **iconic dual cowlicks** (one large spike pointing up and right, with a smaller branching spike next to it).
     - **Oversized Thin Round Glasses**: Giant, perfectly round black-rimmed glasses covering a large portion of his face, with thin elegant lines.
     - **Blue Anime Eyes & Pointy Nose**: Large expressive blue anime oval eyes with detailed pupils and lashes, a tiny diagonal anime nose line, and a confident, clever smirk offset to the side.
     - **Signature Detective Blazer & Bow Tie**: Royal blue school blazer with detailed lapels and a single prominent golden button at the waist, a crisp white-collared shirt underneath, and his **oversized red butterfly bow tie** featuring fabric fold details.
     - **Grey Shorts & Hands**: Light grey dress shorts, with his hand elegantly resting on his hip showing hand-drawn cartoon fingers.
  6. **巴克队长 (Captain Barnacles)**: Completely replace the generic polar bear with a **100% authentic, hand-drawn vector model of the real Captain Barnacles, precisely matching the official reference image**:
     - **Squashed White Head & Blue Ears**: Squashed, horizontal wide pear head with large circular polar bear ears containing a distinct light-blue inner ear pad (`#b5d5ec`).
     - **Octonauts Captain Cap (舰长帽)**: High-fidelity blue captain's hat featuring the **official circular Octonauts logo** (a white circle enclosing a cute cartoon octopus emblem).
     - **Horizontal Capsule Eyes**: Unique horizontal capsule/rounded-rectangle black eyes, each featuring a single tiny white square highlight in the top-outer corner.
     - **Light-Blue Bean Snout (蓝色云朵状吻部)**: Light blue bean-shaped snout area (`#a9cce3`) topped with a small charcoal nose cap, matching the cartoon's signature muzzle, with no thin lines/whiskers.
     - **Teal Commander Uniform**: High-collar dark teal wetsuit jacket with yellow/cream neck arrows (`>>> <<<`), a central silver zipper pull, and a blue utility belt with a round compass buckle.

## Latest Visual Feedback & Bugs (2026-05-24)
The user shared a screenshot showing critical visual regression and proportion bugs when equipping starter gear:
- **Double-Hatting Rendering Bug**: When equipping a unisex swimming cap (`head_universal_cap`), it was rendered *on top of* the base character's signature headwear (e.g. Logger Vick's orange construction helmet), resulting in a bizarre, deformed flying-saucer double-hat.
- **Extreme Proportion Defect**: The peanut face was drawn too narrow, causing the mouth to overflow the head, the eyes to squish/overlap into a cyclops-like shape, and the nose to look like a massive pink bulb.

### Refinement of Shop Accessories (2.5D Premium Swimwear)
The user noted that swimwear accessories still looked like "simple geometric shapes" (e.g. caps being simple semicircles, fins being simple flat triangles). We will completely overhaul all equipped gear to make them look **incredibly premium, detailed, 2.5D, and textured**:
- **Multi-Layered Volumetric SVG**: Re-architect all swimwear layers to use multi-layered overlapping paths for rich depth.
- **Volumetric Gradients & Glossy Highlights**: Utilize detailed color gradients combined with semi-transparent white highlight contours (`opacity="0.6" fill="#fff"`) to represent high-gloss reflections on silicone caps, glass goggles, and carbon-fiber fins.
- **Micro-Details & Textures**:
  - **Caps (`head`)**: Add seam lines, brand logos (dynamic waves, wings), and edge-trim details.
  - **Goggles (`eyes`)**: Add anti-fog lens glare shapes, ergonomic double-rimmed frames, nose bridges, and textured straps wrapping realistically around the head.
  - **Fins (`feet`)**: Ditch simple triangles. Draw realistic professional swim fins with defined foot pockets, thick reinforcing side-stabilizers, water-channeling ribbed blades, and custom emblems (e.g., GG Bond's flame stabilizers, Barnacles' bear paw prints).
  - **Kickboards/Accessories (`hand`)**: Add cutout dual-grip handles, EVA foam shading, and high-fidelity graphics (e.g., Shin-chan's Chocobi box with the pink dinosaur logo).

### Resolution Architecture Refinement
- **Decoupled Hat Layering**: Discard default headwear (helmets, captain caps) from the base character rendering block. Base character block will *only* render bald heads/hair. All custom helmets/caps will render *only* inside the `headKey` switch block (or as default when `headKey` is empty).
- **Proportional Correction**: Re-dimension facial elements (eyes, nose, mouth) and head widths to ensure balanced, authentic proportions (e.g., Logger Vick head width expanded to 36 units, eyes separated cleanly at `cx="41.5"` and `cx="58.5"`, mouth fits naturally within cheek boundaries).
