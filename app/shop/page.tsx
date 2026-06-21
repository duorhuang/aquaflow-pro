import { redirect } from 'next/navigation';

/**
 * Redirect /shop to /profile (shop tab).
 * The shop functionality is embedded in the athlete profile page's shop tab.
 */
export default function ShopRedirect() {
  redirect('/profile');
}
