# Campaign analytics

The live site already loads Umami through Almaz's `umami-site-proxy`. It injects `/umami-init.js`, which loads `/umami/script.js` and sends to `/umami/api/send` on the same origin. The existing subcult.tv website ID is `7c602313-7a18-400b-bcaf-8e605e8dfdd2`. Empty frontend analytics variables were not evidence that pageviews were missing.

The edge owns loading and filtering. The app emits only `patreon-outbound` for clicks to `support.subcult.tv` and `newsletter-signup` after a successful API response. A signup event records a successful request, not completed double opt-in. The inline Vite loader and its build variables have been removed to prevent a second tracker.

`bootstrap.js` is a prepared candidate for the authoritative source at `/opt/server/management/umami-sites/bootstrap.js` on Almaz. `provenance.json` records the inspected source hash. It preserves the eight-site map, DNT/GPC handling, query/fragment/token removal, reduced referrers, and removal of event properties and user IDs. Only subcult.tv accepts the two fixed event names. Its admin pages and foreign-origin paths are excluded. Other sites retain pageviews only.

The candidate has not been installed. At release, first compare the current authoritative file to the recorded source hash. If it changed, reconcile that diff before applying this candidate. Preserve a private backup, install the reconciled source, verify the mounted file and public `/umami-init.js`, and keep the previous source available for rollback. The nginx configuration already permits same-origin script/send paths and strips Cookie, Authorization and Referer headers; no new public dashboard or third-party origin is required.

Verify the release in a fresh anonymous browser: one tracker, SPA navigation to `/support`, a Patreon click, and a successful newsletter request. Check matching stored pageviews and event names in Umami. Confirm no email, query, fragment, or event properties are stored, and that DNT/GPC prevents tracking. Local privacy tests do not replace these production checks.
