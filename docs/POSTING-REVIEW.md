# Posting review and daily Development log

The admin Posts area separates Instagram review, delivery evidence, website entries, Patreon editions and preparation jobs. All new drafts require manual approval. Saving an edit does not approve or dispatch it. Approval submits the saved version; stale edits and approvals return a conflict.

Instagram drafts need an enabled configured PostyBirb account, a JPEG preview and a publication time between 24 hours and 90 days ahead. Account UUIDs are configured through `POSTYBIRB_INSTAGRAM_ACCOUNT_IDS`. Images saved during editing stay behind admin authentication. Approval uploads the selected JPEG privately to PostyBirb before enabling its scheduler. A pending or uncertain submission cannot be sent again with the same approval.

Website entries use `/development` and `/development/:slug`. Daily imports create unpublished articles. Approval records the owner and time; public API queries expose the entry only when that approved time arrives. Unapproved articles cannot be fetched through the public list or slug routes. Private source evidence is available only in the admin review response. The authenticated general article list is `/api/v1/admin/posts`.

## Daily preparation

`studio/automation/social-posting/changemaker_publications.py` reads verified Changemaker output and prepares one website edition and one Patreon edition. It checks complete evidence, accepts only merged pull-request sources, records their identities and hashes, and proposes a time 48 hours ahead. The model cannot run tools or publish. A source digest is prepared once, and imports preserve owner edits.

The service key can call only `POST /api/v1/posting-preparation`; it cannot approve a post. Configure `POSTING_PREPARATION_KEY` in the API environment and in the private producer environment, with `POSTING_INGEST_URL=https://subcult.tv/api/v1/posting-preparation`. Keep this credential and generated content outside Git and frontend build contexts.

The user service and timer sources are in `studio/automation/postiz-dashboard/changemaker-publications.*`. The unit uses a separately staged producer source and the existing Studio configuration/state, leaving other Studio consumers on their current source until the repository cutover is verified. Install the shared Python helpers as well as the producer, prompt, schema and voice source. The daily timer runs at 09:25 UTC after Changemaker and Instagram preparation. A timer success proves draft preparation/import only.

## Patreon adapter

The adapter targets PostyBirb v4.1.0's private HTTPS API. That release is a prerelease. Configure these API variables only from the private service configuration:

- `POSTYBIRB_API_URL`: private HTTPS endpoint ending in `/api`.
- `POSTYBIRB_REMOTE_PASSWORD`: remote API authentication secret.
- `POSTYBIRB_PATREON_ACCOUNT_ID`: one explicitly selected Patreon account UUID.
- `POSTYBIRB_CERT_SHA256`: SHA-256 of the server's leaf certificate DER bytes.
- `POSTYBIRB_SCHEDULING_VERIFIED`: defaults to disabled; set `true` only after checking an owner-approved native scheduled post in Patreon.

The dashboard checks recent login evidence and loads actual Patreon audience IDs from that account. Approval refreshes login, verifies the selected audience and translates supported Markdown into PostyBirb's editor document. Supported formatting is paragraphs, headings, lists, quotes, emphasis, inline code and HTTPS links. Embedded media, HTML and unsupported formatting fail before a provider submission is created.

Approval first records a durable submitting reservation. It then creates a private message draft, attaches the exact account, audience, text and native Patreon schedule, stores the provider ID and starts posting once. Interruptions remain pending or uncertain and require reconciliation in PostyBirb. Refreshing status never retries a submission. An account-specific successful unit and Patreon URL prove accepted scheduling; they do not prove eventual publication.

Patreon login and native scheduling are separate qualification gates. Until both pass, preparation and editing work while approval stays disabled. Do not mark the adapter ready merely because its process or HTTPS endpoint is healthy. Do not send a public test post; use an actual owner-approved post for the first scheduling qualification.

## Verification and recovery

Run frontend tests, type checking, lint and build; the Go suite; and `make check-studio check-studio-automation`. The handler integration tests require `TEST_SOCIAL_DATABASE_URL` pointed at a disposable database. They verify exact saved-version approval, private previews, idempotency, 24-hour enforcement, blocked Patreon delivery and public website visibility at the approved time.

Deployment must retain the previous images, private environment, source archive, database dump and compose command. The new tables are additive. Roll back application images/configuration without deleting approval or draft history. Never restore a database dump over subsequent owner edits merely to undo the interface.
