// Free-tier daily cap for AI consultations.
export const FREE_DAILY_LIMIT = 1;

// Free-tier daily cap for nutrition label photo scans.
export const FREE_LABEL_SCAN_DAILY_LIMIT = 5;

// Premium daily caps. High enough that normal use never hits them, but they
// keep a single subscriber's OpenAI cost bounded (e.g. scripted requests).
export const PREMIUM_DAILY_LIMIT = 30;
export const PREMIUM_LABEL_SCAN_DAILY_LIMIT = 50;
