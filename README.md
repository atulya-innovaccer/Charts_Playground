# Charts Playground

Figma-aligned charting library workspace with Storybook and npm-ready packaging.

## Current Working Model

- The repo root is now the main package
- The current chart implementation is the default implementation
- Storybook and package builds run from the root
- Older exploration wrappers have been removed so the codebase reads like a finished library

## Repo Structure

```text
.
├── src/
│   ├── charts/
│   ├── components/
│   ├── primitives/
│   ├── stories/
│   ├── theme/
│   └── utils/
├── .storybook/
├── package.json
└── CHANGELOG.md
```

## Local Preview

For quick static preview from an existing Storybook build:

```bash
python3 -m http.server 6020 -d storybook-static
```

Then open:

- `http://localhost:6020`

Important:

- This serves the built `storybook-static` output
- If source files change, rebuild Storybook first or you will keep seeing stale output

## Build Storybook

```bash
npm install
npm run build-storybook
```

## Main Areas Of Work

Current focus includes:

- Figma-aligned chart component development
- prop UX improvements in Storybook
- hover/tooltip interactions
- more realistic product-style sample data
- chart-by-chart refinement inside the final package surface

## Workflow Notes

- Make changes in the root package
- Rebuild Storybook when using the static server
- Record meaningful updates in `CHANGELOG.md`
- Push to:
  - `atulya-innovaccer/Charts_Playground` for the current active remote flow

## Changelog Practice

Use `CHANGELOG.md` for high-signal updates only:

- what changed
- where it changed
- why it matters

Keep entries short and grouped by push or milestone, not by every tiny edit.
