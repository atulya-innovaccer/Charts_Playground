# Charts Playground

Chart exploration workspace for building and iterating on a Figma-aligned charting library.

This repo currently contains two parallel tracks:

- `Test1`: reference implementation, including the preserved `V1` chart layer
- `Test2`: active implementation track, now focused on `V3`

## Current Working Model

- Treat `Test2` as the main development folder
- Treat `Test1` as reference-only unless we explicitly decide to port something over
- Keep `V1` intact in `Test1`
- Use `V3` in `Test2` for active chart, interaction, and Storybook improvements
- Do not reintroduce old `V1` chart code into `Test2`

## Repo Structure

```text
.
├── Test1/
│   └── reference explorations and preserved `V1` charts
├── Test2/
│   ├── src/
│   │   ├── v3/
│   │   └── stories/
│   ├── .storybook/
│   └── storybook-static/
└── CHANGELOG.md
```

## Local Preview

For quick static preview from an existing Storybook build:

```bash
cd "Test2"
python3 -m http.server 6020 -d storybook-static
```

Then open:

- `http://localhost:6020`

Important:

- This serves the built `storybook-static` output
- If source files change, rebuild Storybook first or you will keep seeing stale output

## Build Storybook

```bash
cd "Test2"
npm install
npm run build-storybook
```

## Main Areas Of Work

Current focus in `Test2/V3` includes:

- Figma-aligned chart component development
- prop UX improvements in Storybook
- hover/tooltip interactions
- more realistic product-style sample data
- chart-by-chart iteration without disturbing the preserved `V1` work in `Test1`

## Workflow Notes

- Make changes in `Test2`
- Refer to `Test1` when old `V1` behavior or visual language needs to be checked
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
