/**
 * Smart Invoice ID Generator
 * Generates clean prefix from tenant site name or domain (e.g. "topupdisiniyuk.com" -> "TDY", "New Gaming Store" -> "NGS"),
 * followed by YYMMDD and 6-digit random number.
 * 
 * Examples:
 * - "topupdisiniyuk.com" / "topupdisiniyuk" -> "TDY260816123456"
 * - "New Gaming Store" / "newgamingstore" -> "NGS260816123456"
 * - "Toko Game Murah" -> "TGM260816123456"
 * - null / "" -> "INVC260816123456"
 * - customPrefix "DEP" -> "DEP260816123456"
 */
export function generateInvoiceId(nameOrDomain?: string | null, customPrefix?: string | null): string {
  if (customPrefix && customPrefix.trim()) {
    return formatInvoice(customPrefix.trim().toUpperCase());
  }

  let prefix = "";

  if (nameOrDomain && nameOrDomain.trim()) {
    let clean = nameOrDomain.trim();
    // Strip common domain extensions and protocols
    clean = clean.replace(/^https?:\/\//i, '');
    clean = clean.replace(/^(www|app|admin|store|shop)\./i, '');
    clean = clean.replace(/\.(com|id|my|net|org|co\.id|my\.id|web\.id|localhost|shop|store|site|online)$/i, '');

    // 1. If it contains spaces, dashes, dots, or underscores (e.g. "New Gaming Store", "top-up-disini")
    const words = clean.split(/[\s_\-.]+/).filter(Boolean);
    if (words.length > 1) {
      prefix = words.map(w => w.charAt(0)).join('').toUpperCase();
    } else {
      // 2. Check if PascalCase or camelCase (e.g., "TopUpDisiniYuk" -> ["Top", "Up", "Disini", "Yuk"])
      const capitals = clean.match(/[A-Z][a-z0-9]*/g);
      if (capitals && capitals.length > 1) {
        prefix = capitals.map(w => w.charAt(0)).join('').toUpperCase();
      } else {
        // 3. Smart domain compound word matching (e.g., "topupdisiniyuk" -> "top", "up", "disini", "yuk" -> "TDY")
        const lower = clean.toLowerCase();
        const keywords = ['topup', 'top', 'up', 'disini', 'yuk', 'game', 'gaming', 'store', 'shop', 'lapak', 'juragan', 'kios', 'voucher', 'pay', 'zone'];
        
        let matchedKeywords: { word: string; index: number }[] = [];
        for (const kw of keywords) {
          const idx = lower.indexOf(kw);
          if (idx !== -1) {
            matchedKeywords.push({ word: kw, index: idx });
          }
        }

        // Sort by position in string
        matchedKeywords.sort((a, b) => a.index - b.index);

        // Filter out overlapping keywords (e.g. "topup" vs "top" & "up")
        const filteredMatches: string[] = [];
        let lastEnd = -1;
        for (const m of matchedKeywords) {
          if (m.index >= lastEnd) {
            filteredMatches.push(m.word);
            lastEnd = m.index + m.word.length;
          }
        }

        if (filteredMatches.length >= 2) {
          // Extract first letter of each matched word part
          prefix = filteredMatches.map(w => w.charAt(0)).join('').toUpperCase();
        } else {
          // Fallback: first 3 characters
          prefix = clean.substring(0, 3).toUpperCase();
        }
      }
    }
  }

  // Clean prefix: only uppercase alphanumeric, max 4 chars
  prefix = prefix.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 4);

  if (!prefix || prefix.length < 2) {
    prefix = "INVC";
  }

  return formatInvoice(prefix);
}

function formatInvoice(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const randomStr = Math.floor(100000 + Math.random() * 900000).toString();

  return `${prefix}${year}${month}${day}${randomStr}`;
}
