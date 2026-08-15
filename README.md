<p align="center">
  <a href="https://github.com/topdaily-dev/shipkit/actions/workflows/ci.yml"><img src="https://github.com/topdaily-dev/shipkit/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@topdaily-dev/shipkit"><img src="https://img.shields.io/npm/v/@topdaily-dev/shipkit.svg" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node"></a>
</p>

<h1 align="center">shipkit</h1>

<p align="center">
  <strong>Ship OSS releases safely — preflight, changelog, GitHub release, and npm publish.</strong>
</p>

<p align="center">
  <a href="https://github.com/kory-kaai/collab-kit"><strong>collab-kit</strong></a> scaffolds your repo on day 1.
  <a href="https://github.com/topdaily-dev/repomark"><strong>repomark</strong></a> scores repo health.
  <a href="https://github.com/topdaily-dev/badgekit"><strong>badgekit</strong></a> generates README badges.
  <strong>shipkit</strong> ships releases on day 30.
</p>

---

## Why shipkit?

Releasing should not be a checklist you keep in your head.

**shipkit** automates the boring, error-prone release flow for small OSS projects:

- Preflight checks (git status, tests, tooling)
- Conventional-commit changelog generation
- Version bump + `CHANGELOG.md` update
- Git tag + GitHub release via `gh`
- npm publish with dry-run by default

Plain files. No SaaS. You own everything.

## Quick start

```bash
npx @topdaily-dev/shipkit preflight
npx @topdaily-dev/shipkit release --minor --dry-run
npx @topdaily-dev/shipkit release --patch
npx @topdaily-dev/shipkit publish --yes
```

Or do it all at once:

```bash
npx @topdaily-dev/shipkit ship --minor --yes
```

## Commands

| Command | What it does |
|---------|----------------|
| `preflight` | Check git, tests, and tooling before a release |
| `changelog` | Preview release notes from commits since last tag |
| `release` | Bump version, update CHANGELOG, tag, and create GitHub release |
| `publish` | `npm publish` (dry-run unless `--yes`) |
| `ship` | `release` + optional `publish --yes` |

## Examples

Preview the next release without changing anything:

```bash
shipkit release --minor --dry-run
```

Allow a dirty working tree (not recommended for production releases):

```bash
shipkit release --patch --allow-dirty
```

Skip tests during preflight:

```bash
shipkit release --patch --skip-tests
```

## Pair with collab-kit

```bash
npx @korykaai/collab-kit init .
# ... build your project ...
npx @topdaily-dev/shipkit ship --minor --yes
```

## Requirements

- Node.js 20+
- git
- [GitHub CLI](https://cli.github.com/) (`gh`) for `release` and `ship`
- npm account for `publish`

## Development

```bash
git clone https://github.com/topdaily-dev/shipkit.git
cd shipkit
npm test
node bin/shipkit.mjs --help
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
