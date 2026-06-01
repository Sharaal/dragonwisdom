---
name: dragonwisdom-html
description: Use only when explicitly asked to use the DragonWisdom HTML skill. Converts AI-provided information or referenced and attached documents into minimal DragonWisdom-compatible HTML.
---

# DragonWisdom HTML

Use this skill only when the user explicitly asks for the DragonWisdom HTML skill.

## References

- Read `references/index.html` to understand the supported DragonWisdom HTML elements, classes, and feature patterns.
- Use `references/minimal.html` as the base template unless the user requests navigation.
- Use `references/nav.html` as the base template when the user requests navigation.

If a referenced file is missing, tell the user to run `npm run build` in the DragonWisdom repository so the generated references are copied into this skill.

## Required Decisions

Before writing HTML, determine these options from the user's request. If an option is not explicit, ask for it and mention the default.

- Navigation: default `no`. If `yes`, use `references/nav.html`; otherwise use `references/minimal.html`.
- Save button: default `no`. If `yes`, add `saveable` to the `body` class list.
- Multi-page option: default `no`. If `yes`, add `pageable` to the `body` class list.

## Writing Rules

- Put all provided, referenced, or attached information into the HTML using the minimal semantic format documented in `references/index.html`.
- Keep markup as small as possible; add classes only for documented DragonWisdom styling or opt-in behavior.
- Preserve meaning with headings, sections, paragraphs, lists, tables, figures, asides, code blocks, and links.
- Use real German umlauts such as `ä`, `ö`, `ü`, and `ß` instead of `ae`, `oe`, `ue`, or `ss` when writing German text.
- Keep the output self-contained as an HTML document based on the selected template.
- Use `class="sortable"` only for tables that should be sortable.
- Use `class="mermaid"` only for Mermaid diagrams inside `pre`.

## Output Checklist

- The selected template matches the navigation decision.
- `body` contains only the requested feature classes: `saveable`, `pageable`, or both.
- Navigation links match the top-level sections when navigation is enabled.
- The HTML stays compatible with local `file://` usage.
- The JavaScript reference remains optional; do not add custom scripts.
