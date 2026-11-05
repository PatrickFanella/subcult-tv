# Commit-pinned source snippets for review

All excerpts below were read through the authenticated Gitea contents API on
2026-11-05. They are retained as short, reviewable source evidence; no checkout
or product code was changed.

## Kork analytics persistence — `7b0ce9bb2f65542cd09c166b1a400d6739bb13ec`

`internal/db/migrations/0005_analytics.sql:1-19`:

```sql
-- Aggregate visit counts by referrer domain and by country. Rows hold only a
-- page, a day, a label and a count: no IPs, cookies or user agents.
CREATE TABLE stats_referrers (
    page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    day date NOT NULL,
    referrer text NOT NULL CHECK (length(referrer) <= 100),
    count bigint NOT NULL DEFAULT 0,
    PRIMARY KEY (page_id, day, referrer)
);
CREATE TABLE stats_countries (
    page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    day date NOT NULL,
    country text NOT NULL CHECK (length(country) <= 7),
    count bigint NOT NULL DEFAULT 0,
    PRIMARY KEY (page_id, day, country)
);
```

`internal/analytics/analytics.go:24-64` reduces a request `Referer` to a
normalized host (discarding path, query and port) and turns `CF-IPCountry` into
an ISO country code or `unknown`. `internal/store/analytics.go:20-43` persists
only daily aggregate page counts plus those host/country labels; it caps
distinct referrer rows at 200 and folds later ones into `other` (`:11-18`,
`:32-42`).

`internal/server/analytics_test.go:174-189` queries the actual test database
schema and asserts that the analytics tables have only page/block IDs, day,
label and count columns. The current head's hosted CI passed.

**Copy boundary:** “Analytics stores daily aggregate page, referrer-domain and
country counts—not visitor IP addresses, cookies or user-agent strings.” is
source-supported for analytics persistence. Do not shorten that to “Kork uses
no cookies”: `internal/server/server.go:30` and `:322-326` define/read a
`zelda_session` cookie for signed-in account sessions. “No trackers” is broader
than this evidence (it needs an asset/dependency/runtime review), so remove it
or narrow it to the analytics sentence above.

## Chatty Cat capacity — `cd4d052d50a80d9c9afa5c92583e50c242e95da8`

`internal/chatlimits/limits.go:14-24, 33-45`:

```go
// PaneChannels remains the initial merged-feed limit.
const PaneChannels = 6

// DefaultWorkspaceChannels is separate from the pane limit.
const DefaultWorkspaceChannels = 12

// MaxWorkspaceChannels bounds one view's transcript sources.
const MaxWorkspaceChannels = 24

func Capacity(value int) int {
    if value == 0 { return DefaultWorkspaceChannels }
    return max(1, min(value, MaxWorkspaceChannels))
}
```

This establishes six as an initial merged-pane default, not the maximum
capability. The same file validates each workspace up to its bounded configured
limit. Focused coverage is `internal/chatlimits/limits_test.go`; current-head
Gitea CI passed.

**Copy:** “Start with a six-channel merged pane; configured workspaces can
include up to 24 channels.” Do not claim that all 24 are enabled on the public
deployment without a runtime configuration check.

## Subcult OS ticket-pricing model — `d64d66e0586add9ae6e375f21c28c6cdccb70cc9`

`backend/internal/app/event_lifecycle.go:15-25, 61-90`:

```go
TicketAllocation  int
PricingMode       string
TicketPriceCents  int
TicketCurrency    string
ReservedCount     int

func (l eventLifecycle) HasPublishableTicketAllocation() bool {
    return l.TicketAllocation > 0
}
func (l eventLifecycle) CanPublish() bool {
    return l.IsDraft() && l.ReadyToPublish() && l.HasPublishableTicketAllocation()
}
func (l eventLifecycle) CanChangePricing(nextMode string, nextTicketPriceCents int, nextTicketCurrency string) bool {
    return l.ReservedCount == 0 || (nextMode == l.PricingMode && nextTicketPriceCents == l.TicketPriceCents && nextTicketCurrency == l.TicketCurrency)
}
```

This is concrete pricing-model and lifecycle code, with focused integration
tests including `ticket_journey_test.go`, `ticket_capacity_integration_test.go`
and `door_authority_integration_test.go`; the current-head hosted run passed.
It does not prove that paid ticket sales, payment settlement, or payouts are
enabled on the public deployment.

**Copy:** “The current public flow is free reservations. The code also contains
ticket-pricing support, but paid ticket sales and payouts are not being offered
through the public service.”
