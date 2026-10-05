# SUBCULT service integrations

These integrations are maintained in the combined `subcult-tv/studio` source. The initial Gitea and service proxy packages were imported from Almaz's existing Studio checkout during the approved logo rollout. Their vendored Gitea and theme.park sources retain their licenses and provenance. Earlier verification documents describe the original deployment, not the replacement-logo rollout.

The user approved B, C and D without registration lines. The production generator is `brand-tools/subcult_assets.py`; `brands/subcult/logo-selection.json` records the selection and source hashes. C is the primary mark, B is the outlined alternate and D is the compact mark. All have one continuous underscore path.

Build the selected brand first, then the integrations:

```sh
rtk proxy env BRAND_ONLY=subcult python studio/brand-tools/build_packs.py
rtk proxy python studio/integrations/gitea/build.py
rtk proxy python studio/integrations/gitea/audit.py
rtk proxy python studio/integrations/services/build.py
```

The Gitea package includes a versioned logo stylesheet and a custom header hook. Its two rules apply only to `data-theme="subcult-studio"`, preserving other theme choices. Preserve an existing custom header before adding the hook; merge the link into it rather than replacing its contents. Gitea loads template changes after a restart.

The service proxy uses D for its injected favicon and small headers, and C for larger marks. Asset URLs are versioned. Its HTML filtering, upstream routes, authentication boundaries and fallback behavior remain in the existing proxy implementation. Live `routes.json`, binaries and deployment receipts stay out of Git.

Runtime deployment and rollback evidence belong in the private Machinum operations vault. Rebuilding a package does not deploy it.
