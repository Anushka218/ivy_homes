export function formatProjectPrice(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 'Price unavailable';
  }

  /*
   * Observed dataset convention:
   * >= 10 → lakh
   * < 10  → crore
   */
  if (n >= 10) {
    return `₹${n.toFixed(2)} Lakh`;
  }

  return `₹${n.toFixed(2)} Crore`;
}

export function projectPriceToINR(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return null;
  }

  return n >= 10
    ? n * 100000
    : n * 10000000;
}