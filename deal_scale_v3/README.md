# Deal Scale Twenty App

Deal Scale is a proprietary assurance application built on Twenty's official
app and SDK interfaces. Twenty owns the authenticated workspace, CRM
primitives, permissions, workflows, and app shell; Deal Scale owns assurance
objects, evidence contracts, detectors, scoring, and specialized UI.

This package is intentionally isolated from the existing Deal Scale Next.js
application and does not fork or modify Twenty core. Twenty remains subject to
its upstream license; Deal Scale-specific source remains proprietary.

## Features

List the top things your app does, for example:

- Feature one
- Feature two
- Feature three

## Getting started

Setup instructions live in [SETUP.md](SETUP.md).

The generated scaffold currently targets Twenty SDK `2.41.0`, uses Yarn `4.13.0`,
and requires Node `24.5.0` or newer within the declared engine range. Docker is
required for the local Twenty development server.

## Publishing

The `Publish` workflow (`.github/workflows/publish.yml`) publishes the app to npm with provenance using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers). To publish:

1. On npmjs.com register this repository as a trusted publisher of your package, pointing at the `publish.yml` workflow.
2. Bump the version in `package.json`, then push a version tag (e.g. `git tag v1.0.0 && git push --tags`) or run the workflow manually from the Actions tab.

Publishing with provenance is also how you prove ownership when claiming your app in a Twenty marketplace.

## Changelog

Notable changes are documented in [CHANGELOG.md](CHANGELOG.md).

## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
