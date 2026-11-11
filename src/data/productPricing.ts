export type ProductPlanId = 'mon' | 'lifetime';

export interface ProductPlan {
  id: ProductPlanId;
  label: string;
  priceUsd: number;
  priceNote: string;
}

const defaultPlans: ProductPlan[] = [
  { id: 'mon', label: '1 Month', priceUsd: 35, priceNote: 'USD · 30 days' },
  { id: 'lifetime', label: 'Lifetime', priceUsd: 150, priceNote: 'USD · Lifetime' },
];

const spooferPlans: ProductPlan[] = [
  { id: 'mon', label: '1 Month', priceUsd: 50, priceNote: 'USD · 30 days' },
  { id: 'lifetime', label: 'Lifetime', priceUsd: 150, priceNote: 'USD · Lifetime' },
];

export function getProductPlans(productSlug: string): ProductPlan[] {
  return productSlug === 'spoofer' ? spooferPlans : defaultPlans;
}

export function getDefaultPlan(productSlug: string): ProductPlan {
  const plans = getProductPlans(productSlug);
  return plans.find((p) => p.id === 'mon') ?? plans[0]!;
}

export function formatPlanPrice(usd: number): string {
  return `$${usd}`;
}

/** Plan is chosen on Zadeyo checkout — internal /go/ path only. */
export function checkoutUrlWithPlan(baseUrl: string, _planId: ProductPlanId): string {
  return baseUrl;
}

export function getProductFromPrice(productSlug: string): number {
  return getDefaultPlan(productSlug).priceUsd;
}
