import type { ProductFeatureGroup } from './product-types';

function feature(name: string, desc: string) {
  return { name, desc };
}

/** HWID Spoofer modules — names match checkout portal rows; one short note each. */
export const spooferFeatureGroups: ProductFeatureGroup[] = [
  {
    name: 'Hardware rotation',
    items: [
      feature(
        'Hardware spoofer with cleaner',
        'Runs the rotation workflow on a PC you own and clears leftover traces from earlier runs before you re-check the machine.',
      ),
      feature(
        'Disk serial and MAC rotation',
        'Changes disk and network identifiers the system reports so a new Rust login does not inherit the flagged fingerprint.',
      ),
      feature(
        'GPU ID profile tools',
        'Adjusts GPU-related profile fields in the rotation set on supported Windows builds.',
      ),
    ],
  },
  {
    name: 'Verification workflow',
    items: [
      feature(
        'Compatibility scan',
        'Checks Windows version, driver state, and administrator rights before rotation steps start.',
      ),
      feature(
        'Verification checklist',
        'Post-rotation list so you confirm the profile changed before you launch Rust again.',
      ),
    ],
  },
  {
    name: 'Portal and support',
    items: [
      feature(
        'Portal step-by-step workflow',
        'Follows checkout portal order: activate the key, run the tool, complete verification, then launch.',
      ),
      feature(
        'Discord setup support',
        'Discord help for install order and reading the verification list when a step is unclear.',
      ),
    ],
  },
];
