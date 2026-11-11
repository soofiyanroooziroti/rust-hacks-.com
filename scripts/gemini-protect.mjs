/** Placeholder protection for Gemini translate (restore must be exact). */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, '..');

const BASE_TERMS = [
  'Rust',
  'Rust Hacks',
  'HWID Spoofer',
  'UGC Account Recovery',
  'EasyAnti-Cheat',
  'rust-hacks.com',
  'Unturned cheats',
  'Aion 2 hack',
  'CS2 cheats',
  'aimbot',
  'wallhack',
  'chams',
  'Discord',
  'Windows',
  'Lifetime',
  'Monthly',
  'HWID',
  'ESP',
  'DMA',
  'FOV',
  'HVCI',
  'TPM',
  'Secure Boot',
  'ACE',
  'UGC',
  'USD',
  '1 Month $35',
  'Lifetime $150',
  '$35',
  '$150',
  '1 Week',
  '1 Month',
  'USD · 7 days (P7D)',
  'USD · 30 days (P30D)',
  'USD · lifetime (P99Y)',
];

function glossaryTerms() {
  const file = path.join(projectRoot, 'src/i18n/glossary.json');
  if (!fs.existsSync(file)) return [];
  try {
    const { keep } = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(keep) ? keep : [];
  } catch {
    return [];
  }
}

const ALL_TERMS = [...new Set([...BASE_TERMS, ...glossaryTerms()])].sort((a, b) => b.length - a.length);

const URL_RE = /https?:\/\/[^\s"'<>]+|\/go\/[^\s"'<>]*|\/[a-zA-Z0-9][^\s"'<>]*/g;

export function protectContent(text) {
  const map = new Map();
  let n = 0;
  let out = String(text);

  out = out.replace(URL_RE, (match) => {
    if (match.length < 2) return match;
    const key = `[[T${++n}]]`;
    map.set(key, match);
    return key;
  });

  for (const term of ALL_TERMS) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, (match) => {
      const key = `[[T${++n}]]`;
      map.set(key, match);
      return key;
    });
  }

  return { text: out, map };
}

export function restoreContent(text, map) {
  let out = String(text);
  for (const [key, value] of map) {
    out = out.split(key).join(value);
  }
  return out;
}

export function placeholdersRestored(text, map) {
  for (const key of map.keys()) {
    if (text.includes(key)) return false;
  }
  return true;
}

export function scrubForbiddenClaims(text) {
  return String(text)
    .replace(/\bundetected\b/gi, '')
    .replace(/\bsafe\b/gi, '');
}

export function stripCodeFences(text) {
  let out = String(text).trim();
  if (out.startsWith('```')) {
    out = out.replace(/^```(?:json|markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/, '');
  }
  return out.trim();
}
