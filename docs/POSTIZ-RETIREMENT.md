# Postiz retirement

PostyBirb owns social account connections and delivery. SUBCULT retains private draft editing, explicit approval, saved-version checks and delivery receipts. The preparation runner remains read-only, with publishing disabled.

## Application cutover

The Instagram adapter uses the same private HTTPS service, remote password and certificate pin as Patreon. `POSTYBIRB_INSTAGRAM_ACCOUNT_IDS` restricts the Instagram targets. Credentials stay in the private deployment environment.

Approval reserves a request ID and content hash before any provider write. The adapter uploads one JPEG into an unscheduled private submission, sets the literal caption and sole account, then saves the submission ID locally. It validates the provider draft before enabling a future `SINGLE` schedule. Initial approval never calls immediate posting. Explicit Retry now on Scheduled & delivered may start a validated replacement for a completed, wholly failed Instagram post, using its saved approved content. Edit and reschedule uses a future time. Recovery retains the failed submission and saves the replacement receipt before dispatch; pending or uncertain outcomes block another retry. Duplicate approvals reuse confirmed receipts; uncertainty requires reconciliation in PostyBirb. A queued receipt does not prove Instagram publication.

Migration `010_social_provider` identifies the provider while preserving legacy Postiz records. Only unsubmitted saved drafts may have their account UUIDs remapped. Increment their versions and replace request IDs so stale approvals cannot approve the changed account selection. Preserve captions, dates and image bytes. Never remap submitted approvals.

Qualification requires the Go suite, isolated database approval tests, frontend tests/lint/build, private live upload and account readback, and authenticated dashboard checks after deployment. A private upload check must remain unscheduled and remove only its own probe. Actual Instagram delivery requires a separate owner-approved post.

## Service retirement and recovery

Before stopping Postiz, inspect its complete post inventory and active Temporal workflows, run the existing backup service, verify its artifact manifest, and retain an independent copy. Save Compose configuration, container identities, restart policies, volume inventory, application configuration and the public route.

Disable `postiz-backup.timer`, set restart policies to `no`, and stop only Compose project `postiz`. Retain all six containers, images, configuration and volumes. Keep the protected `postiz.subcult.tv` route as a redirect to PostyBirb. Preserve preparation timers and the existing Studio bundle.

Application releases retain prior images, configuration, a database dump and the saved-draft account mapping receipt. Recovery restores the prior application configuration/images and remaps only unchanged, unsubmitted drafts using the retained receipt. Preserve the additive migration and all approvals created after cutover. Restoring Postiz also requires restoring the original restart policies, starting its Compose project, enabling the backup timer and restoring the original Caddy route. Validate Caddy before reloading it. Do not restore the whole database or delete volumes as part of routine rollback.

The canonical Machinum retirement report records deployed revisions, backup locations, live verification and any remaining limitations.
