// T025, T026, T107: WhatsApp list parser and name sanitizer

/**
 * Section header pattern — detects labels like "LISTA:", "ESPERA:", "RESERVA:" etc.
 * Used to split the raw WhatsApp message into sections.
 */
const SECTION_HEADER_RE = /^[A-ZÀ-Ü\s]{3,}:\s*$/

/**
 * Extracts only the content under the "LISTA" section from a raw WhatsApp message.
 * Looks for a line matching /LISTA/i and reads numbered entries until the next
 * section header (e.g. "ESPERA:") or end of text.
 *
 * If no LISTA section is found, falls back to parsing the entire text.
 *
 * @param text - Raw text copied from WhatsApp
 * @returns Raw lines belonging to the LISTA section (or entire text as fallback)
 */
function extractListaSection(text: string): string[] {
  const lines = text.split(/\r?\n/)

  // Find the index of the LISTA header
  const listaIndex = lines.findIndex(line => /^LISTA\s*:?\s*$/i.test(line.trim()))

  if (listaIndex === -1) {
    // No LISTA header found — return all lines (backward-compatible)
    return lines
  }

  // Collect lines after LISTA until the next section header or end
  const listaLines: string[] = []
  for (let i = listaIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    // Stop at next section header (e.g. "ESPERA:", "RESERVA:")
    if (SECTION_HEADER_RE.test(line) || /^[A-ZÀ-Ü\s]{3,}:$/i.test(line)) {
      break
    }
    listaLines.push(lines[i])
  }

  return listaLines
}

/**
 * Parse WhatsApp copied list into player names.
 * Handles various formats:
 * - Standard numbered list under a "LISTA:" section header
 * - Plain line-by-line lists without section headers
 * - Lines with emojis, timestamps, phone numbers (all stripped)
 *
 * @param text - Raw text from WhatsApp
 * @returns Array of clean player names
 */
export function parseWhatsAppList(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  // Extract only the LISTA section when present
  const lines = extractListaSection(text)

  // Process each line
  const names = lines
    .map(line => sanitizeName(line))
    .filter(name => name.length >= 2) // Min 2 chars per data-model

  return names
}

/**
 * Sanitize a name by removing unwanted characters
 * - Removes emojis
 * - Removes numbers (except in names like João3)
 * - Removes special chars except: á é í ó ú ã õ â ê ô ç spaces
 * - Trims whitespace
 * 
 * @param text - Raw text
 * @returns Clean name
 */
export function sanitizeName(text: string): string {
  // Remove emoji range (most common ones)
  let clean = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
  clean = clean.replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
  clean = clean.replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
  clean = clean.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
  clean = clean.replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
  clean = clean.replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
  
  // Remove timestamps (HH:MM format)
  clean = clean.replace(/\d{1,2}:\d{2}/g, '')
  
  // Remove standalone numbers at start (WhatsApp numbering)
  clean = clean.replace(/^\d+[\s\.\-:]+/, '')
  
  // Remove phone numbers (sequence of 8+ digits with optional separators)
  clean = clean.replace(/\b[\d\s\-\(\)]{8,}\b/g, '')
  
  // Keep only letters (including accented), spaces, and apostrophes
  clean = clean.replace(/[^a-zA-ZÀ-ÿ\s']/g, '')
  
  // Normalize multiple spaces to single space
  clean = clean.replace(/\s+/g, ' ')
  
  // Trim
  clean = clean.trim()
  
  return clean
}
