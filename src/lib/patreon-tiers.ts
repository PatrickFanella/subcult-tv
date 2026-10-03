import type { APIPatreonTier } from '@/lib/api';

export interface SupportTier {
  name: string;
  price: string;
  amountCents: number;
  includes: string[];
}

export function descriptionText(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document
    .querySelectorAll('script, style, iframe, object, embed')
    .forEach((node) => node.remove());
  document.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
  document.querySelectorAll('p, li, div').forEach((node) => node.append('\n'));
  return (document.body.textContent || '').trim();
}

export function tierPrice(cents: number): string {
  if (cents === 0) return '$0';
  return (
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100) + ' / month'
  );
}

export function publishedTiers(tiers: APIPatreonTier[]): SupportTier[] {
  return tiers
    .filter((tier) => tier.published)
    .sort((a, b) => a.amount_cents - b.amount_cents)
    .map((tier) => ({
      name: tier.title,
      price: tierPrice(tier.amount_cents),
      amountCents: tier.amount_cents,
      includes: descriptionText(tier.description).split('\n').filter(Boolean),
    }));
}
