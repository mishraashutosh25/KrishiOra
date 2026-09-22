/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Pure Timezone-Independent Date Utility (Gregorian Calendar Arithmetic)
 * ============================================================================
 * Agricultural lifecycle planning requires pure date-only semantics.
 * Dates are represented strictly as ISO strings ("YYYY-MM-DD").
 *
 * This utility uses pure integer Julian Day Number (JDN) mathematical algorithms.
 * It has ZERO dependence on Javascript's `Date` object or UTC/local conversions,
 * completely eliminating date shifts, daylight saving time artifacts, and timezone bugs.
 * ============================================================================
 */

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

/**
 * Checks whether a year is a leap year under Gregorian calendar rules:
 * Divisible by 4, but not by 100 unless also divisible by 400.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the exact number of days in a given month of a given year.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
  }
  const daysPerMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return daysPerMonth[month - 1];
}

/**
 * Parses a date string strictly in "YYYY-MM-DD" format.
 */
export function parseDateOnly(dateStr: string): DateParts {
  if (!isValidIsoDate(dateStr)) {
    throw new Error(
      `Invalid ISO date string: "${dateStr}". Expected format YYYY-MM-DD with valid calendar day.`
    );
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d };
}

/**
 * Validates that a string is a well-formed, calendar-valid ISO date string (YYYY-MM-DD).
 * Checks month range (1-12) and valid day counts per month (including leap year Feb 29).
 */
export function isValidIsoDate(dateStr: string): boolean {
  if (typeof dateStr !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const [y, m, d] = dateStr.split("-").map(Number);
  if (y < 1900 || y > 2200) return false;
  if (m < 1 || m > 12) return false;

  const maxDays = getDaysInMonth(y, m);
  return d >= 1 && d <= maxDays;
}

/**
 * Converts a Gregorian date (year, month, day) into an integer Julian Day Number (JDN).
 * Standard astronomical integer formula.
 */
function dateToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Converts an integer Julian Day Number (JDN) back into a Gregorian date (year, month, day).
 */
function jdnToDate(jdn: number): DateParts {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/**
 * Formats date parts into standard "YYYY-MM-DD" string.
 */
export function formatDateParts(parts: DateParts): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

/**
 * Adds an integer number of days to an ISO date string ("YYYY-MM-DD").
 * Uses pure integer JDN arithmetic. Supports positive and negative offsets.
 */
export function addDays(dateStr: string, days: number): string {
  const { year, month, day } = parseDateOnly(dateStr);
  const jdn = dateToJdn(year, month, day);
  const resultJdn = jdn + Math.round(days);
  const resultParts = jdnToDate(resultJdn);
  return formatDateParts(resultParts);
}

/**
 * Calculates the exact integer day difference between two ISO date strings (date2 - date1).
 */
export function diffDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseDateOnly(dateStr1);
  const d2 = parseDateOnly(dateStr2);
  const jdn1 = dateToJdn(d1.year, d1.month, d1.day);
  const jdn2 = dateToJdn(d2.year, d2.month, d2.day);
  return jdn2 - jdn1;
}

/**
 * Alias for diffDays.
 */
export const daysBetween = diffDays;

/**
 * Returns true if dateStr1 is strictly before dateStr2.
 */
export function isBefore(dateStr1: string, dateStr2: string): boolean {
  return diffDays(dateStr1, dateStr2) > 0;
}

/**
 * Returns true if dateStr1 is strictly after dateStr2.
 */
export function isAfter(dateStr1: string, dateStr2: string): boolean {
  return diffDays(dateStr1, dateStr2) < 0;
}

/**
 * Returns true if dateStr1 is equal to or before dateStr2.
 */
export function isSameOrBefore(dateStr1: string, dateStr2: string): boolean {
  return diffDays(dateStr1, dateStr2) >= 0;
}
