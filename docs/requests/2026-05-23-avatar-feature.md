# Request: Avatar (2D 小人) Feature on Player Side

## Date
2026-05-23

## Description
The user noticed that the planned "avatar raising" (培养小人) feature is missing from the player's side of the application. This feature was supposed to allow players to use their earned XP to purchase various swimming gear and equipment for a 2D avatar.

## Status
Resolved: The feature was already implemented in `components/athlete/ShopAndCloset.tsx` and was rendering inside the `(athlete)/profile` page via a "Shop" tab. However, the entry point was hidden behind a generic `UserCircle` icon on the main workout dashboard, leading the user to miss it.

To fix this:
1. Replaced the plain `level` circle in the header of `app/(athlete)/workout/page.tsx` with a miniature `AvatarRenderer` to display the actual 2D avatar.
2. Made the entire user info block a clickable link leading straight to the profile/shop page.
3. Added a prominent, animated "🛍️ 商城搭配" button in the header right next to the user's XP/level to explicitly highlight the feature.
