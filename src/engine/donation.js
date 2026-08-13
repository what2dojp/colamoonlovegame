import { GAME_CONFIG } from "../config/game.config.js";

export function fateFromDonation(amount) {
  const rows = [...GAME_CONFIG.donationToFate].sort((a, b) => a.minAmount - b.minAmount);
  let fate = rows[0]?.fate ?? 0;
  for (const row of rows) {
    if (amount >= row.minAmount) fate = row.fate;
  }
  return fate;
}

export function createMockDonationProvider() {
  const listeners = new Set();
  return {
    name: "mockDonationProvider",
    onDonation(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    simulate({ amount, message, from = "觀眾" }) {
      const payload = {
        provider: "mock",
        amount: Number(amount) || 0,
        message: message || "",
        from,
        at: Date.now(),
      };
      listeners.forEach((fn) => fn(payload));
      return payload;
    },
  };
}
