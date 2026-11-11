/**
 * Sister marketing sites — footer links only (external URLs; never sitemap routes).
 * Labels stay English: "{Game} cheats" (protected in translate + i18n:check).
 */
export interface SisterSite {
  label: string;
  href: string;
  /** Hostnames for this property (no www). Omitted from footer on the current site. */
  hosts: string[];
}

export const SISTER_SITES: SisterSite[] = [
  {
    label: 'Apex Legends cheats',
    href: 'https://cheatsapexlegends.org/',
    hosts: ['cheatsapexlegends.org', 'cheatsapexlegends.com'],
  },
  {
    label: 'Valorant cheats',
    href: 'https://cheats-valorant.org/',
    hosts: ['cheats-valorant.org', 'cheatsvalorant.org'],
  },
  { label: 'FC27 cheats', href: 'https://cheatsfc27.org/', hosts: ['cheatsfc27.org'] },
  { label: 'Rust Hacks', href: 'https://rust-hacks.com/', hosts: ['rust-hacks.com'] },
  { label: 'Warzone cheats', href: 'https://getwarzonecheats.org/', hosts: ['getwarzonecheats.org'] },
  { label: 'DayZ cheats', href: 'https://dayz-cheats.org/', hosts: ['dayz-cheats.org'] },
  { label: 'Wardogs cheats', href: 'https://hackforwardogs.com/', hosts: ['hackforwardogs.com'] },
  { label: 'CS2 cheats', href: 'https://cheatsforcs2.com/', hosts: ['cheatsforcs2.com'] },
  { label: 'Aion 2 cheats', href: 'https://aion2hack.com/', hosts: ['aion2hack.com'] },
  { label: 'Unturned cheats', href: 'https://unturnedcheats.org/', hosts: ['unturnedcheats.org'] },
];

export const SISTER_SITE_LABELS: readonly string[] = SISTER_SITES.map((s) => s.label);

function normalizeHost(host: string): string {
  return host.replace(/^www\./i, '').toLowerCase();
}

export function footerSisterSites(currentHost: string): { href: string; label: string }[] {
  const here = normalizeHost(currentHost);
  return SISTER_SITES.filter((site) => !site.hosts.some((h) => normalizeHost(h) === here)).map(
    ({ href, label }) => ({ href, label }),
  );
}
