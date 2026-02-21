# Agents

## Verification

Run `pnpm type-check` after every change to ensure there are no type errors.

## UI Components

Use the shadcn CLI (`npx shadcn@latest add <component>`) to install UI components in `apps/web`. Never write shadcn components by hand.

## User-Facing Dialogs

Never use native JS `alert()`, `confirm()`, or `prompt()`. Use custom UI components instead.

## Documentation

Use HTML `<table>` elements for tables in all documentation files (README.md, MDX docs). Do not use markdown pipe tables.
