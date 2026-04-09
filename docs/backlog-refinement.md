# Backlog Refinement (PM-31, PM-39, PM-40)

## Purpose

Backlog refinement sessions ensure all user stories are clearly written, properly scoped, and have acceptance criteria before they enter a sprint.

---

## Refined User Stories (PM-39)

Stories have been rewritten into standard format: **As a [user], I want [goal] so that [reason].**

| Key | Refined Story |
|-----|--------------|
| PM-2 | As a registered user, I want to upload a photo of a clothing item so that it is added to my digital wardrobe with its image stored. |
| PM-6 | As a registered user, I want to add a clothing item by pasting a product URL or SKU so that I can track items without needing a photo. |
| PM-7 | As a registered user, I want to tag my wardrobe items with occasions, weather conditions, and dress codes so that the system can recommend relevant outfits. |
| PM-8 | As a registered user, I want to request an outfit recommendation for a specific occasion so that I know what to wear to a casual outing, work, wedding, etc. |
| PM-9 | As a registered user, I want to request an outfit based on current weather conditions (temperature and/or condition) so that my clothing is appropriate for the weather. |
| PM-10 | As a registered user, I want to specify a dress code and get matching outfit suggestions so that I meet the expected formality for an event. |
| PM-11 | As a registered user, I want to filter outfit recommendations by a colour preference so that my outfit has a cohesive colour scheme. |
| PM-12 | As a registered user, I want to select a specific item I must wear and have the system build an outfit around it so that I always include my chosen piece. |
| PM-13 | As a registered user, I want to see multiple distinct outfit options at once so that I have choices rather than a single recommendation. |
| PM-14 | As a registered user, I want outfit recommendations to always include footwear when available so that I get a complete head-to-toe look. |
| PM-15 | As an admin, I want to view, deactivate, and delete user accounts so that I can manage the user base and handle abuse. |
| PM-16 | As an admin, I want to view a log of system activity (actions, user IDs, timestamps, IPs) so that I can monitor usage and investigate issues. |
| PM-17 | As a developer, I want a structured, documented database schema so that all team members understand the data model. |
| PM-18 | As a user, I want the interface to use a clear typographic hierarchy so that text is easy to read at all sizes. |
| PM-19 | As a user with visual impairments, I want to toggle high-contrast mode so that I can use the app comfortably regardless of my visual needs. |
| PM-20 | As a user, I want outfit recommendations presented in a structured format (showing which item fills each slot) so that I can quickly understand the full look. |

---

## Acceptance Criteria (PM-40)

### PM-9 — Request outfit by weather
- [ ] POST /outfits/by-weather accepts `temperature` (number, °C) and/or `condition` (string)
- [ ] Returns at least one item if user has tagged weather items
- [ ] Falls back to random selection if no matching items found
- [ ] Frontend shows temperature input and condition dropdown
- [ ] Submit triggers API call and renders OutfitResult

### PM-13 — Generate multiple outfit options
- [ ] POST /outfits/multiple returns 3 distinct outfit combinations by default
- [ ] `count` parameter (max 10) controls number of options
- [ ] No two returned outfits share the same set of item IDs
- [ ] Frontend renders each option as a separate OutfitResult card with numbered label

### PM-15 — Manage user accounts
- [ ] GET /admin/users returns all users (admin token required)
- [ ] POST /admin/users/:id/deactivate sets is_active=false
- [ ] POST /admin/users/:id/activate sets is_active=true
- [ ] DELETE /admin/users/:id removes user and all their data
- [ ] Admin cannot deactivate or delete their own account
- [ ] Non-admin token receives 403

### PM-19 — High-contrast mode
- [ ] Toggle button visible on all pages (fixed position)
- [ ] Clicking toggle adds/removes `.high-contrast` class on `<body>`
- [ ] Preference persisted in localStorage across page reloads
- [ ] High-contrast palette: black background, white text, yellow interactive elements
- [ ] Inputs, cards, tables, and nav all styled correctly in high-contrast mode
