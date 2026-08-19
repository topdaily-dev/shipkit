# npm publish setup

shipkit uses **npm trusted publishing** (OIDC) from GitHub Actions.

## One-time setup (topdaily-dev npm account)

1. Sign in at [npmjs.com](https://www.npmjs.com/) as **topdaily-dev** (owner of the `@topdaily-dev` scope).
2. **Access** → **Publishing access** → **Trusted publishers** → **Add**
3. Configure:
   - **Organization / user:** `topdaily-dev`
   - **Repository:** `shipkit` (full path: `topdaily-dev/shipkit`)
   - **Workflow filename:** `publish-npm.yml`
   - **Environment:** leave empty unless you use GitHub Environments
   - **Permissions:** `npm publish`

### First publish (new package)

OIDC cannot create a brand-new scoped package. Do **one** manual publish first:

```bash
npm login   # as topdaily-dev (+ 2FA if enabled)
git clone https://github.com/topdaily-dev/shipkit.git
cd shipkit
npm test
npm publish --access public --provenance
```

After that, GitHub Actions owns subsequent releases via trusted publishing.

## Verify

```bash
npm view @topdaily-dev/shipkit version
npx @topdaily-dev/shipkit --help
```

## CI publish

Automatic on GitHub **Release published**, or manually:

```bash
gh workflow run "Publish to npm" --repo topdaily-dev/shipkit
```

## Migrating from @korykaai/shipkit

The old package [`@korykaai/shipkit`](https://www.npmjs.com/package/@korykaai/shipkit) is deprecated in favor of `@topdaily-dev/shipkit`. Canonical repo: [topdaily-dev/shipkit](https://github.com/topdaily-dev/shipkit).


Bootstrap: npx @korykaai/collab-kit init . --oss-toolchain
