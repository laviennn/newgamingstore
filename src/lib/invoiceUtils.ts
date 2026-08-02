export function generateInvoiceId(tenantName: string = "NewGamingStore"): string {
  // Extract initials from tenant name (e.g. "New Gaming Store" -> "NGS", "newgamingstore" -> "N")
  // Let's make it smarter: uppercase characters or first letters of words
  let initials = "";
  
  // If it's a single word CamelCase or pascal case, try to extract capitals
  const capitals = tenantName.match(/[A-Z]/g);
  if (capitals && capitals.length > 1) {
    initials = capitals.join('').toUpperCase();
  } else {
    // Split by spaces and take first letters
    const words = tenantName.split(/[\s_-]+/);
    if (words.length > 1) {
      initials = words.map(w => w.charAt(0)).join('').toUpperCase();
    } else {
      // Fallback: just first 3 letters
      initials = tenantName.substring(0, 3).toUpperCase();
    }
  }

  // Ensure initials are max 4 chars, min 2 chars if possible
  initials = initials.substring(0, 4);
  if (initials.length < 2 && tenantName.length >= 2) {
      initials = tenantName.substring(0, 2).toUpperCase();
  }

  // Timestamp part (YYMMDD)
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  // Random 6 digits
  const randomStr = Math.floor(100000 + Math.random() * 900000).toString();

  return `${initials}${year}${month}${day}${randomStr}`;
}
