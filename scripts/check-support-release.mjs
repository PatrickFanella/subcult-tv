// Read-only publication gate. No account changes, scheduling, or deployment.
// It sends one GET to the site's campaign API and compares the published
// Patreon tiers with the offer in
// studio/content/patreon/support-redesign-2026-10/patreon-copy.md.
const origin = process.env.SUPPORT_CHECK_ORIGIN || 'https://subcult.tv';

const FREE = /^(?:free|free follow|follow free)$/i;
const EXPECTED = [
  { name: 'Free', amount_cents: 0, matches: (title) => FREE.test(title) },
  ...[
    ['Supporter', 500],
    ['Backer', 1000],
    ['Patron', 2500],
    ['Groceries', 40000],
    ['Rent', 150000],
  ].map(([name, amount_cents]) => ({
    name,
    amount_cents,
    matches: (title) => title.toLowerCase() === name.toLowerCase(),
  })),
];
// Promises the October offer removed. A match is a note to review, not a failure.
const RETIRED_PROMISES =
  /field note|ledger|early access|early preview|weekly|every week|voice in direction/i;

const dollars = (cents) =>
  '$' + (cents / 100).toLocaleString('en-US', { maximumFractionDigits: cents % 100 ? 2 : 0 });

const response = await fetch(new URL('/api/v1/patreon/campaign', origin));
if (!response.ok) throw new Error(`Campaign API returned ${response.status}`);
const data = await response.json();
if (!data.campaign) throw new Error('Campaign unavailable; keep publication on hold');

const published = data.tiers
  .filter((tier) => tier.published)
  .map((tier) => ({ ...tier, title: String(tier.title).trim() }))
  .sort((a, b) => a.amount_cents - b.amount_cents);

const problems = [];
const claimed = new Set();
for (const expected of EXPECTED) {
  const found = published.filter((tier) => expected.matches(tier.title));
  found.forEach((tier) => claimed.add(tier));
  const label = `${expected.name} (${dollars(expected.amount_cents)})`;
  if (found.length === 0) {
    problems.push(`Missing: ${label} is not published. Create or publish it.`);
    continue;
  }
  if (found.length > 1) {
    problems.push(
      `Duplicate: ${found.length} published tiers are named ${expected.name}. Keep one.`,
    );
  }
  for (const tier of found) {
    if (tier.amount_cents !== expected.amount_cents) {
      problems.push(
        `Mispriced: ${expected.name} is ${dollars(tier.amount_cents)}. Set it to ${dollars(expected.amount_cents)}.`,
      );
    }
  }
}
for (const tier of published) {
  if (!claimed.has(tier)) {
    problems.push(
      `Unexpected: ${tier.title} (${dollars(tier.amount_cents)}) is published and is not in the October offer. Unpublish it after checking for members.`,
    );
  }
}
const notes = published
  .filter((tier) => RETIRED_PROMISES.test(tier.description || ''))
  .map((tier) => `Review: the ${tier.title} description still mentions a retired promise.`);

console.log(
  JSON.stringify(
    {
      cached_at: data.cached_at ?? null,
      published: published.map((tier) => ({ title: tier.title, amount_cents: tier.amount_cents })),
      expected: EXPECTED.map(({ name, amount_cents }) => ({ title: name, amount_cents })),
      tierGateReady: problems.length === 0,
    },
    null,
    2,
  ),
);
if (problems.length > 0) {
  console.error(
    'Release held: Patreon must show Free, Supporter ($5), Backer ($10), Patron ($25), Groceries ($400) and Rent ($1,500), and nothing else.',
  );
  for (const problem of problems) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(
    'Tier gate passes. Review tier descriptions, Discord access, API cache freshness and the release checks before publishing.',
  );
}
for (const note of notes) console.error(`- ${note}`);
