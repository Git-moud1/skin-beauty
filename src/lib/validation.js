// Shared, framework-agnostic validation helpers.

export function normalizePhone(phone) {
  return String(phone || "").replace(/[\s\-()+]/g, "").trim();
}

export function isValidPhone(phone) {
  const p = normalizePhone(phone);
  return /^\d{6,15}$/.test(p);
}

export function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

export function isValidName(name) {
  return typeof name === "string" && name.trim().length >= 2;
}

export function isValidPrice(price) {
  const n = Number(price);
  return Number.isFinite(n) && n >= 0;
}
