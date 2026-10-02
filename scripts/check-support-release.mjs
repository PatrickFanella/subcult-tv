// Read-only publication gate. No account changes, scheduling, or deployment.
const origin = process.env.SUPPORT_CHECK_ORIGIN || 'https://subcult.tv';
const response = await fetch(new URL('/api/v1/patreon/campaign', origin));
if (!response.ok) throw new Error(`Campaign API returned ${response.status}`);
const data = await response.json();
if (!data.campaign) throw new Error('Campaign unavailable; keep publication on hold');
const tiers = data.tiers.filter(tier => tier.published).sort((a, b) => a.amount_cents - b.amount_cents);
const ready = tiers.length === 2 && /^free(?: follow)?$/i.test(tiers[0].title) && tiers[0].amount_cents === 0 && /^backer$/i.test(tiers[1].title) && tiers[1].amount_cents === 1000;
console.log(JSON.stringify({ published: tiers.map(tier => ({title:tier.title,amount_cents:tier.amount_cents})), tierGateReady:ready }, null, 2));
if (!ready) { console.error('Release held: Patreon must show only Free and Backer ($10).'); process.exitCode = 1; }
else console.log('Tier gate passes. Review provider benefits, API cache freshness, October 6 timing, and the release checks before publishing.');
