/**
 * Strict Date Formatting Utility for NTechBay-Library
 * Standardizes all date presentation to DD/MM/YYYY format
 */

export function formatDateToDDMMYYYY(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '—';
  try {
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (!trimmed || trimmed === '—') return '—';

      // Check if already in DD/MM/YYYY format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        return trimmed;
      }

      // Check for YYYY-MM-DD format (standard HTML5 date input)
      const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymdMatch) {
        const [, year, month, day] = ymdMatch;
        return `${day}/${month}/${year}`;
      }

      // Check for MM/DD/YYYY format
      const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mdyMatch) {
        const [, m, d, year] = mdyMatch;
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${year}`;
      }
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return typeof dateInput === 'string' ? dateInput : '—';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

/**
 * Formats date and time: DD/MM/YYYY, HH:MM AM/PM
 */
export function formatDateTimeToDDMMYYYY(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return formatDateToDDMMYYYY(dateInput);

    const dateStr = formatDateToDDMMYYYY(d);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return formatDateToDDMMYYYY(dateInput);
  }
}
