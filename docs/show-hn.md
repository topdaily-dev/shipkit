# Show HN — shipkit

Ready-to-post draft for [Hacker News](https://news.ycombinator.com/submit).

**Best time to post:** Tuesday–Thursday, 9–11am US Eastern. Stagger at least 24h from a collab-kit post.

---

## Title

```
Show HN: shipkit – ship OSS releases (changelog, tag, GitHub release, npm)
```

## Body

```
I built collab-kit to scaffold GitHub workflows on day 1 (PR templates, CI, hooks, docs). The gap was day 30: actually shipping a release.

shipkit is a small CLI that runs the release checklist I kept forgetting:

  npx @topdaily-dev/shipkit preflight
  npx @topdaily-dev/shipkit release --minor --dry-run
  npx @topdaily-dev/shipkit ship --patch --yes

What it does:
  - preflight: clean git tree, tests, gh/npm tooling
  - changelog: conventional commits since last tag
  - release: bump version, update CHANGELOG.md, git tag, gh release create
  - publish: npm publish (dry-run by default)

Plain files you own. No SaaS. Pairs with collab-kit:

  npx @korykaai/collab-kit init .
  npx @topdaily-dev/shipkit ship --minor --yes

npm: https://www.npmjs.com/package/@topdaily-dev/shipkit
repo: https://github.com/topdaily-dev/shipkit
collab-kit: https://github.com/kory-kaai/collab-kit

What release steps am I missing from the default flow?
```

---

## First comment

```
Comparison:

- release-please / semantic-release: great for large teams, more config and GitHub App setup
- changesets: monorepo-first, heavier than I need for solo OSS CLIs
- manual: version bump + changelog + gh release + npm publish — works but error-prone

shipkit targets solo maintainers who want a file-owned, npx-friendly release flow without adopting a framework.

Requires: git, gh (for release), npm (for publish). All commands support --dry-run.
```

---

## Checklist before posting

- [x] `@topdaily-dev/shipkit` published on npm
- [x] `shipkit preflight` passes on a real repo
- [x] README shows collab-kit pairing
- [ ] Pin shipkit on GitHub profile (manual — see below)

Bootstrap: npx @korykaai/collab-kit init . --oss-toolchain
