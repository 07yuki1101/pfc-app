// Subscription (プレミアム) settings shared by client and server.
// Must match the RevenueCat dashboard / App Store Connect setup.
export const PREMIUM_ENTITLEMENT_ID = "premium";
export const PREMIUM_MONTHLY_PRICE_JPY = 300;

// Developer accounts that get premium for free (same idea as トラ管's OWNER_EMAILS).
export const OWNER_EMAILS = ["07yuki1101@gmail.com", "apptaro1209@gmail.com"];

export function isOwnerEmail(email: string | null | undefined): boolean {
  return !!email && OWNER_EMAILS.includes(email.toLowerCase());
}
