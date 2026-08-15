# Contributing to shipkit

## Development

```bash
git clone https://github.com/topdaily-dev/shipkit.git
cd shipkit
npm test
node bin/shipkit.mjs --help
```

## Pull requests

1. Fork and create a feature branch
2. Add tests for behavior changes (`lib/*.test.mjs`)
3. Run `npm test` before opening a PR
4. Keep PRs focused — one logical change per PR

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add dry-run support to publish
fix: handle repos without tags
docs: update release examples
```
