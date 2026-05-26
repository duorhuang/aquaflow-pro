import { neon } from '@neondatabase/serverless';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("DATABASE_URL not set in .env!");
    process.exit(1);
}

const sql = neon(dbUrl);

async function seed() {
    console.log("=== Seeding 12-Slot Avatar Shop Items ===");

    // Clear existing
    console.log("1. Clearing existing ShopItem table...");
    await sql`DELETE FROM "ShopItem"`;
    console.log("  Table cleared.");

    const items: any[] = [];
    const sort = 0;

    // ==========================================
    // BASE — Character base (gender selector)
    // ==========================================
    items.push({ name: 'Male Base', category: 'Base', tier: 'basic', price: 0, slotType: 'base', gender: 'male', imageKey: 'base_male' });
    items.push({ name: 'Female Base', category: 'Base', tier: 'basic', price: 0, slotType: 'base', gender: 'female', imageKey: 'base_female' });

    // ==========================================
    // SKIN TONES — 6 presets
    // ==========================================
    items.push({ name: 'Fair', category: 'Skin Tone', tier: 'basic', price: 0, slotType: 'skinTone', gender: 'unisex', imageKey: 'skin_fair', previewColor: '#fdd1a2' });
    items.push({ name: 'Light', category: 'Skin Tone', tier: 'basic', price: 0, slotType: 'skinTone', gender: 'unisex', imageKey: 'skin_light', previewColor: '#f5d0a9' });
    items.push({ name: 'Medium', category: 'Skin Tone', tier: 'basic', price: 0, slotType: 'skinTone', gender: 'unisex', imageKey: 'skin_medium', previewColor: '#e0b896' });
    items.push({ name: 'Tan', category: 'Skin Tone', tier: 'basic', price: 0, slotType: 'skinTone', gender: 'unisex', imageKey: 'skin_tan', previewColor: '#c69c6d' });
    items.push({ name: 'Dark', category: 'Skin Tone', tier: 'basic', price: 0, slotType: 'skinTone', gender: 'unisex', imageKey: 'skin_dark', previewColor: '#8d5524' });
    items.push({ name: 'Deep', category: 'Skin Tone', tier: 'basic', price: 0, slotType: 'skinTone', gender: 'unisex', imageKey: 'skin_deep', previewColor: '#5c3a21' });

    // ==========================================
    // EXPRESSIONS — 6 faces
    // ==========================================
    items.push({ name: 'Neutral', category: 'Expression', tier: 'basic', price: 0, slotType: 'expression', gender: 'unisex', imageKey: 'expression_neutral' });
    items.push({ name: 'Happy', category: 'Expression', tier: 'basic', price: 0, slotType: 'expression', gender: 'unisex', imageKey: 'expression_happy' });
    items.push({ name: 'Determined', category: 'Expression', tier: 'basic', price: 0, slotType: 'expression', gender: 'unisex', imageKey: 'expression_determined' });
    items.push({ name: 'Excited', category: 'Expression', tier: 'basic', price: 0, slotType: 'expression', gender: 'unisex', imageKey: 'expression_excited' });
    items.push({ name: 'Proud', category: 'Expression', tier: 'basic', price: 0, slotType: 'expression', gender: 'unisex', imageKey: 'expression_proud' });
    items.push({ name: 'Focused', category: 'Expression', tier: 'basic', price: 0, slotType: 'expression', gender: 'unisex', imageKey: 'expression_focused' });

    // ==========================================
    // HAIR — 10 styles
    // ==========================================
    items.push({ name: 'Short', category: 'Hair', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_short' });
    items.push({ name: 'Spiky', category: 'Hair', tier: 'common', price: 200, slotType: 'hair', gender: 'unisex', imageKey: 'hair_spiky' });
    items.push({ name: 'Long', category: 'Hair', tier: 'common', price: 200, slotType: 'hair', gender: 'unisex', imageKey: 'hair_long' });
    items.push({ name: 'Ponytail', category: 'Hair', tier: 'common', price: 200, slotType: 'hair', gender: 'female', imageKey: 'hair_ponytail' });
    items.push({ name: 'Bun', category: 'Hair', tier: 'common', price: 200, slotType: 'hair', gender: 'female', imageKey: 'hair_bun' });
    items.push({ name: 'Curly', category: 'Hair', tier: 'rare', price: 500, slotType: 'hair', gender: 'unisex', imageKey: 'hair_curly' });
    items.push({ name: 'Bob', category: 'Hair', tier: 'common', price: 200, slotType: 'hair', gender: 'female', imageKey: 'hair_bob' });
    items.push({ name: 'Side Part', category: 'Hair', tier: 'common', price: 200, slotType: 'hair', gender: 'male', imageKey: 'hair_sidepart' });
    items.push({ name: 'Buzz Cut', category: 'Hair', tier: 'basic', price: 0, slotType: 'hair', gender: 'male', imageKey: 'hair_buzzcut' });
    items.push({ name: 'Mohawk', category: 'Hair', tier: 'rare', price: 500, slotType: 'hair', gender: 'unisex', imageKey: 'hair_mohawk' });

    // ==========================================
    // HATS — 8 swimming caps & headwear
    // ==========================================
    items.push({ name: 'Blue Silicone Cap', category: 'Hat', tier: 'basic', price: 100, slotType: 'hat', gender: 'unisex', imageKey: 'hat_siliconecap_blue' });
    items.push({ name: 'Black Silicone Cap', category: 'Hat', tier: 'basic', price: 100, slotType: 'hat', gender: 'unisex', imageKey: 'hat_siliconecap_black' });
    items.push({ name: 'Goggles on Forehead', category: 'Hat', tier: 'common', price: 250, slotType: 'hat', gender: 'unisex', imageKey: 'hat_goggles_forehead' });
    items.push({ name: 'Sun Visor', category: 'Hat', tier: 'common', price: 300, slotType: 'hat', gender: 'unisex', imageKey: 'hat_sunvisor' });
    items.push({ name: 'Baseball Cap', category: 'Hat', tier: 'common', price: 300, slotType: 'hat', gender: 'unisex', imageKey: 'hat_baseballcap' });
    items.push({ name: 'Beanie', category: 'Hat', tier: 'rare', price: 500, slotType: 'hat', gender: 'unisex', imageKey: 'hat_beanie' });
    items.push({ name: 'Pink Swim Cap', category: 'Hat', tier: 'common', price: 200, slotType: 'hat', gender: 'female', imageKey: 'hat_swimcap_pink' });
    items.push({ name: 'Green Swim Cap', category: 'Hat', tier: 'common', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_swimcap_green' });

    // ==========================================
    // TOPS — 7 swimming tops
    // ==========================================
    items.push({ name: 'Blue Rash Guard', category: 'Top', tier: 'common', price: 300, slotType: 'top', gender: 'unisex', imageKey: 'top_rashguard_blue' });
    items.push({ name: 'Black Rash Guard', category: 'Top', tier: 'common', price: 300, slotType: 'top', gender: 'unisex', imageKey: 'top_rashguard_black' });
    items.push({ name: 'Competition Swimsuit', category: 'Top', tier: 'rare', price: 800, slotType: 'top', gender: 'unisex', imageKey: 'top_competition_swimsuit' });
    items.push({ name: 'Training Shirt', category: 'Top', tier: 'basic', price: 200, slotType: 'top', gender: 'unisex', imageKey: 'top_training_shirt' });
    items.push({ name: 'Team Hoodie', category: 'Top', tier: 'rare', price: 600, slotType: 'top', gender: 'unisex', imageKey: 'top_hoodie' });
    items.push({ name: 'Team Jacket', category: 'Top', tier: 'legendary', price: 1200, slotType: 'top', gender: 'unisex', imageKey: 'top_team_jacket' });
    items.push({ name: 'Pink One-Piece', category: 'Top', tier: 'common', price: 400, slotType: 'top', gender: 'female', imageKey: 'top_onepiece_pink' });

    // ==========================================
    // BOTTOMS — 6 swimming bottoms
    // ==========================================
    items.push({ name: 'Blue Swim Trunks', category: 'Bottom', tier: 'basic', price: 200, slotType: 'bottom', gender: 'male', imageKey: 'bottom_swimtrunks_blue' });
    items.push({ name: 'Navy Swim Briefs', category: 'Bottom', tier: 'basic', price: 150, slotType: 'bottom', gender: 'male', imageKey: 'bottom_swimbriefs' });
    items.push({ name: 'Black Jammers', category: 'Bottom', tier: 'common', price: 350, slotType: 'bottom', gender: 'male', imageKey: 'bottom_jammers_black' });
    items.push({ name: 'Athletic Shorts', category: 'Bottom', tier: 'basic', price: 200, slotType: 'bottom', gender: 'unisex', imageKey: 'bottom_athleticshorts' });
    items.push({ name: 'Red Swim Briefs', category: 'Bottom', tier: 'common', price: 250, slotType: 'bottom', gender: 'male', imageKey: 'bottom_swimbriefs_red' });
    items.push({ name: 'Pink One-Piece Bottom', category: 'Bottom', tier: 'common', price: 300, slotType: 'bottom', gender: 'female', imageKey: 'bottom_onpiece_bottom' });

    // ==========================================
    // SHOES — 6 footwear (fins, flip-flops, slides)
    // ==========================================
    items.push({ name: 'Long Training Fins', category: 'Shoes', tier: 'common', price: 400, slotType: 'shoes', gender: 'unisex', imageKey: 'shoes_fins_long' });
    items.push({ name: 'Short Fins', category: 'Shoes', tier: 'basic', price: 250, slotType: 'shoes', gender: 'unisex', imageKey: 'shoes_fins_short' });
    items.push({ name: 'Flip-Flops', category: 'Shoes', tier: 'basic', price: 150, slotType: 'shoes', gender: 'unisex', imageKey: 'shoes_flipflops' });
    items.push({ name: 'Pool Slides', category: 'Shoes', tier: 'common', price: 200, slotType: 'shoes', gender: 'unisex', imageKey: 'shoes_slides' });
    items.push({ name: 'White Athletic Shoes', category: 'Shoes', tier: 'common', price: 300, slotType: 'shoes', gender: 'unisex', imageKey: 'shoes_athletic_white' });
    items.push({ name: 'Water Shoes', category: 'Shoes', tier: 'rare', price: 500, slotType: 'shoes', gender: 'unisex', imageKey: 'shoes_water_shoes' });

    // ==========================================
    // HANDHELD — 7 swimming training items
    // ==========================================
    items.push({ name: 'Blue Kickboard', category: 'Handheld', tier: 'basic', price: 150, slotType: 'handheld', gender: 'unisex', imageKey: 'handheld_kickboard_blue' });
    items.push({ name: 'Red Kickboard', category: 'Handheld', tier: 'basic', price: 150, slotType: 'handheld', gender: 'unisex', imageKey: 'handheld_kickboard_red' });
    items.push({ name: 'Pull Buoy', category: 'Handheld', tier: 'common', price: 250, slotType: 'handheld', gender: 'unisex', imageKey: 'handheld_pullbuoy' });
    items.push({ name: 'Swimming Snorkel', category: 'Handheld', tier: 'rare', price: 600, slotType: 'handheld', gender: 'unisex', imageKey: 'handheld_snorkel' });
    items.push({ name: 'Stopwatch', category: 'Handheld', tier: 'common', price: 300, slotType: 'handheld', gender: 'unisex', imageKey: 'handheld_stopwatch' });
    items.push({ name: 'Water Bottle', category: 'Handheld', tier: 'basic', price: 100, slotType: 'handheld', gender: 'unisex', imageKey: 'handheld_waterbottle' });
    items.push({ name: 'Training Fins (Handheld)', category: 'Handheld', tier: 'rare', price: 450, slotType: 'handheld', gender: 'unisex', imageKey: 'handheld_training_fins' });

    // ==========================================
    // ACCESSORY — 4 accessories
    // ==========================================
    items.push({ name: 'Gold Medal', category: 'Accessory', tier: 'legendary', price: 2000, slotType: 'accessory', gender: 'unisex', imageKey: 'accessory_medal_gold' });
    items.push({ name: 'Swim Watch', category: 'Accessory', tier: 'common', price: 350, slotType: 'accessory', gender: 'unisex', imageKey: 'accessory_watch' });
    items.push({ name: 'Necklace', category: 'Accessory', tier: 'rare', price: 500, slotType: 'accessory', gender: 'unisex', imageKey: 'accessory_necklace' });
    items.push({ name: 'Goggles Around Neck', category: 'Accessory', tier: 'basic', price: 150, slotType: 'accessory', gender: 'unisex', imageKey: 'accessory_goggles_neck' });

    // ==========================================
    // BACKGROUNDS — 4 pool/beach scenes
    // ==========================================
    items.push({ name: 'Pool Deck', category: 'Background', tier: 'basic', price: 200, slotType: 'background', gender: 'unisex', imageKey: 'bg_pool' });
    items.push({ name: 'Underwater', category: 'Background', tier: 'common', price: 300, slotType: 'background', gender: 'unisex', imageKey: 'bg_underwater' });
    items.push({ name: 'Competition Arena', category: 'Background', tier: 'rare', price: 500, slotType: 'background', gender: 'unisex', imageKey: 'bg_competition' });
    items.push({ name: 'Beach Sunset', category: 'Background', tier: 'legendary', price: 800, slotType: 'background', gender: 'unisex', imageKey: 'bg_beach' });

    // ==========================================
    // SPECIAL SKINS — 5 anime character overlays
    // ==========================================
    items.push({ name: 'Luffy — Straw Hat Pirate', category: 'Special Skin', tier: 'legendary', price: 3000, slotType: 'specialSkin', gender: 'unisex', imageKey: 'skin_luffy' });
    items.push({ name: 'Goku — Saiyan Warrior', category: 'Special Skin', tier: 'legendary', price: 3000, slotType: 'specialSkin', gender: 'unisex', imageKey: 'skin_goku' });
    items.push({ name: 'Naruto — Hokage Ninja', category: 'Special Skin', tier: 'legendary', price: 3000, slotType: 'specialSkin', gender: 'unisex', imageKey: 'skin_naruto' });
    items.push({ name: 'Conan — Detective', category: 'Special Skin', tier: 'rare', price: 2000, slotType: 'specialSkin', gender: 'unisex', imageKey: 'skin_conan' });
    items.push({ name: 'L — Death Note Detective', category: 'Special Skin', tier: 'rare', price: 2000, slotType: 'specialSkin', gender: 'unisex', imageKey: 'skin_l_deathnote' });

    console.log(`2. Generated ${items.length} items. Inserting...`);

    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        console.log(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} (${batch.length} items)`);

        await Promise.all(batch.map((item, idx) => {
            const uuid = crypto.randomUUID();
            return sql`
                INSERT INTO "ShopItem" ("id", "name", "category", "tier", "price", "imageKey", "slotType", "gender", "sortOrder", "previewColor")
                VALUES (${uuid}, ${item.name}, ${item.category}, ${item.tier}, ${item.price}, ${item.imageKey}, ${item.slotType}, ${item.gender}, ${sort + i + idx}, ${item.previewColor || null})
            `;
        }));
    }

    console.log(`\nSeeding complete! ${items.length} items inserted.`);
    console.log("  Breakdown:");
    console.log("  Base: 2 | Skin Tones: 6 | Expressions: 6");
    console.log("  Hair: 10 | Hats: 8 | Tops: 7 | Bottoms: 6");
    console.log("  Shoes: 6 | Handheld: 7 | Accessory: 4 | Backgrounds: 4");
    console.log("  Special Skins: 5");
}

seed().catch(e => {
    console.error("Seeding failed:", e);
    process.exit(1);
});
