import ND from 'nepali-date-converter';

const NepaliDateClass: any = (ND as any).default || ND;

// Map of English day names to Nepali day names
export const NEPALI_DAYS: Record<string, string> = {
  'Sunday': 'आइतबार',
  'Monday': 'सोमबार',
  'Tuesday': 'मङ्गलबार',
  'Wednesday': 'बुधबार',
  'Thursday': 'बिहीबार',
  'Friday': 'शुक्रबार',
  'Saturday': 'शनिबार'
};

export const NEPALI_NUMBERS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९'
};

// Converts English numerals (e.g. "2083") to Nepali numerals ("२०८३")
export function toNepaliNumerals(numStr: string | number): string {
  const str = String(numStr);
  return str.split('').map(char => NEPALI_NUMBERS[char] || char).join('');
}

// Converts a Gregorian date string (YYYY-MM-DD) to a formatted Nepali date (BS) in English script (e.g., "24 Asar 2083")
export function getEnglishNepaliDate(dateString: string): string {
  if (!dateString) return '';
  try {
    // Set library to English format
    NepaliDateClass.language = 'en';
    const d = new NepaliDateClass(new Date(dateString));
    return d.format('DD MMMM YYYY');
  } catch (e) {
    return dateString;
  }
}

// Converts a Gregorian date string (YYYY-MM-DD) to a formatted Nepali date (BS) in Nepali Unicode (e.g., "२४ असार २०८३")
export function getUnicodeNepaliDate(dateString: string): string {
  if (!dateString) return '';
  try {
    // Set library to Nepali format
    NepaliDateClass.language = 'np';
    const d = new NepaliDateClass(new Date(dateString));
    return d.format('DD MMMM YYYY');
  } catch (e) {
    return dateString;
  }
}

// Gets the Nepali day name (e.g. "बुधबार") of a Gregorian date string
export function getNepaliDayName(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const days = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
    return days[dayIndex];
  } catch (e) {
    return '';
  }
}
