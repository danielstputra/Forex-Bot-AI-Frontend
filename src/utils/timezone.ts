/**
 * Formats an ISO date string into the user's local browser time with hours, minutes, and seconds.
 */
export function formatToLocalTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return '--:--:--';
  }
}

/**
 * Returns the short timezone name/abbreviation of the user's browser.
 * e.g. "WIB", "WITA", "JST", "GMT+7", "EST", etc.
 */
export function getLocalTimezoneName(): string {
  try {
    // Try using Intl API to get timezone name
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map common timezones to readable abbreviations
    const tzMapping: Record<string, string> = {
      'Asia/Jakarta': 'WIB',
      'Asia/Makassar': 'WITA',
      'Asia/Jayapura': 'WIT',
      'Asia/Singapore': 'SGT',
      'Asia/Tokyo': 'JST',
      'America/New_York': 'EST',
      'America/Chicago': 'CST',
      'America/Denver': 'MST',
      'America/Los_Angeles': 'PST',
      'Europe/London': 'GMT',
      'Europe/Paris': 'CET',
    };

    if (tzMapping[tz]) {
      return tzMapping[tz];
    }

    // Fallback to offset formatting (e.g., GMT+7)
    const offset = new Date().getTimezoneOffset();
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const sign = offset <= 0 ? '+' : '-';
    return `GMT${sign}${hours}`;
  } catch (e) {
    return 'UTC';
  }
}
