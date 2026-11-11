/** ISO date (YYYY-MM-DD) — edit when you publish a status refresh. */
export const STATUS_LAST_UPDATED = '2026-11-10';

export type StatusTone = 'green' | 'red' | 'blue';

/** Current store state. Green = updated and usable. */
export const STATUS_TONE: StatusTone = 'green';

export const STATUS_STATE_LABEL = 'Updated';
export const STATUS_STATE_DETAIL = 'Can be used';

export const STATUS_PAGE_INTRO =
  'Rust Hacks on rust-hacks.com. Read the color before you launch.';

export interface StatusLegendItem {
  tone: StatusTone;
  label: string;
  text: string;
}

export const STATUS_LEGEND: StatusLegendItem[] = [
  { tone: 'green', label: 'Green', text: 'Updated. You can use it.' },
  { tone: 'red', label: 'Red', text: 'Not updated. Do not use it.' },
  {
    tone: 'blue',
    label: 'Blue',
    text: 'Updating. Developers are working. Not ready yet.',
  },
];

export interface StatusUpdateEntry {
  title: string;
  /** Display range or date, e.g. 10 Nov 2026 */
  when: string;
  summary: string;
}

/** Newest first. */
export const STATUS_RECENT_UPDATES: StatusUpdateEntry[] = [
  {
    title: 'Store check',
    when: '10 Nov 2026',
    summary:
      'Rust Hacks is updated. The label is green, so it can be used.',
  },
  {
    title: 'Scripting ban wave',
    when: '5 Nov 2026',
    summary:
      'With the November patch, Facepunch banned 3,000+ accounts tied to public and private scripting tools. EAC bans for injected code, aimbots, and ESP stay permanent and often land late. A new account to dodge a live ban is treated as evasion.',
  },
  {
    title: 'Printed and Polished',
    when: '5 Nov 2026',
    summary:
      'Intel Macs are dropped. Volumetric clouds stay on. Player update jobs default on. Military Tunnels doors need explosives. Handmade SMG damage is 21. Sprint costs more food and water. Loot panels close out of range. DPVs accelerate faster and burn less fuel.',
  },
  {
    title: 'Secure Boot and TPM 2.0',
    when: 'Feb–Mar 2026',
    summary:
      'Servers can require Secure Boot and TPM 2.0. Leave both on. Players disagree about the rule. This store does not tell you to turn them off.',
  },
];

const UPDATED_DISPLAY = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Format YYYY-MM-DD as "10 Nov 2026" (static at build). */
export function formatStatusUpdated(isoDate: string = STATUS_LAST_UPDATED): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return UPDATED_DISPLAY.format(new Date(Date.UTC(year, month - 1, day)));
}

/** Shared line for /status/ and the home setup strip. */
export function formatActiveStatusLine(isoDate: string = STATUS_LAST_UPDATED): string {
  return `Updated · ${formatStatusUpdated(isoDate)}`;
}
