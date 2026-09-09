/**
 * Date and duration formatting.
 *
 * Contract timestamps are ledger seconds, so everything here takes unix
 * seconds rather than milliseconds.
 */

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_ONLY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateTime(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return "—";
  return DATE_TIME.format(new Date(unixSeconds * 1000));
}

export function formatDate(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return "—";
  return DATE_ONLY.format(new Date(unixSeconds * 1000));
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Each step divides the remaining duration into the next-larger unit. */
const DIVISIONS: { per: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { per: 60, unit: "second" },
  { per: 60, unit: "minute" },
  { per: 24, unit: "hour" },
  { per: 7, unit: "day" },
  { per: 4.34524, unit: "week" },
  { per: 12, unit: "month" },
  { per: Number.POSITIVE_INFINITY, unit: "year" },
];

/** "3 hours ago", "in 6 days". Used for audit trails and access expiry. */
export function formatRelative(unixSeconds: number, now = Date.now() / 1000): string {
  let duration = unixSeconds - now;

  for (const { per, unit } of DIVISIONS) {
    if (Math.abs(duration) < per) {
      return RELATIVE.format(Math.round(duration), unit);
    }
    duration /= per;
  }
  return RELATIVE.format(Math.round(duration), "year");
}

/** Turns an access window in seconds into "30 minutes", "24 hours", "7 days". */
export function formatDuration(seconds: number): string {
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  if (seconds < 86400) {
    const hours = Math.round(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const days = Math.round(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"}`;
}

/** Access windows the consent manager is designed around. */
export const ACCESS_DURATION_OPTIONS = [
  { value: "1800", label: "30 minutes — single consultation" },
  { value: "86400", label: "24 hours — one visit" },
  { value: "604800", label: "7 days — course of treatment" },
  { value: "2592000", label: "30 days — ongoing care" },
];

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
