// Helpers for turning a location's address into something you can open on a map.
// An address value can be either free text ("Via Dante Alighieri, Monterotondo")
// or a share link pasted from Apple / Google Maps. Free text opens a Google Maps
// search (works on every device); a link is opened as-is so the exact pin is kept.

export function isMapUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function mapHref(value: string): string {
  const v = value.trim();
  if (isMapUrl(v)) return v;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`;
}

// Short label to show for a map link: the address text itself, or a generic
// "View on map" when the stored value is just a URL.
export function mapLabel(value: string): string {
  return isMapUrl(value) ? 'View on map' : value.trim();
}
