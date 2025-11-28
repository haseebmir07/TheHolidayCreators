// controllers/utils.js

/**
 * parseOfferings(input)
 * Accepts:
 *  - JSON-string of array (e.g. '["Wifi","Kitchen"]')
 *  - Array (["Wifi","Kitchen"])
 *  - Comma-separated string ("Wifi, Kitchen")
 * Returns: array of trimmed non-empty strings
 */
function parseOfferings(input) {
  if (!input && input !== "") return [];
  // Already an array
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);

  // String case
  if (typeof input === "string") {
    // Try JSON parse
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch (e) {
      // not JSON — continue to comma-split
    }
    // comma separated fallback
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // otherwise empty
  return [];
}

module.exports = { parseOfferings };
