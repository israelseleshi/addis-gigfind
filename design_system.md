# Design System - Addis GigFind (Tangelo Theme)

## 1. Visual Identity
- **Name:** Tangelo Design System v1.0
- **Vibe:** Vibrant, Functional, High-Performance, Accessible.
- **Core Philosophy:** energetic primary actions balanced by a robust neutral structure.

## 2. Color Palette

### Primary Brand (Tangelo Orange)
Used for primary actions, active states, and brand highlights.
- **50:** `#fff7ed` (Background tints)
- **100:** `#ffedd5`
- **200:** `#fed7aa`
- **300:** `#fdba74`
- **400:** `#fb923c`
- **500:** `#f97316` **(Base / Primary Button)**
- **600:** `#ea580c` (Hover states)
- **700:** `#c2410c`
- **800:** `#9a3412`
- **900:** `#7c2d12` (Text on orange bg)

### Neutral Scale (Zinc)
Used for UI structure, text, and borders.
- **White:** `#ffffff` (Card backgrounds, Main bg)
- **Zinc 50:** `#fafafa` (Subtle backgrounds)
- **Zinc 100:** `#f4f4f5` (Page backgrounds)
- **Zinc 200:** `#e4e4e7` (Borders)
- **Zinc 400:** `#a1a1aa` (Icons, inactive text)
- **Zinc 600:** (Standard body text)
- **Zinc 900:** `#18181b` (Headings, Main text)

### Semantic Gradients
- **Marketing Surface:** `bg-gradient-to-br from-orange-500 to-orange-700`

## 3. Typography
- **Font Family:** **Inter** (Optimize for readability).
- **Headings:** Tight tracking to give a modern, precise feel.

| Style | Tailwind Class | Usage |
| :--- | :--- | :--- |
| **Display** | `text-6xl font-extrabold tracking-tight` | Hero sections, Big Numbers. |
| **Page Title** | `text-5xl font-bold` | Landing Page Headers. |
| **Section** | `text-4xl font-bold` | Major page sections. |
| **Card Title** | `text-2xl font-semibold` | Gig Titles, Dashboard Widgets. |
| **Body Large** | `text-lg leading-relaxed` | Introductions, Lead paragraphs. |
| **Body Std** | `text-base text-zinc-600` | Standard description, content. |
| **Small** | `text-sm text-zinc-500` | Meta data, timestamps, captions. |

## 4. UI Components (Shadcn + Tangelo)

### Buttons
- **Primary:** `bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md shadow-sm`.
- **Secondary:** `bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 rounded-md`.
- **Ghost:** `text-zinc-600 hover:text-orange-600 hover:bg-orange-50`.
- **Destructive:** `bg-red-600 text-white`.

### Inputs & Forms
- **Field:** `bg-white border-zinc-200 text-zinc-900 rounded-md`.
- **Focus:** `ring-2 ring-orange-500 ring-offset-2 border-orange-500`.
- **Labels:** `text-sm font-medium text-zinc-700`.

### Cards & Layout
- **Card:** `bg-white border border-zinc-200 shadow-sm rounded-lg`.
- **Header:** `p-6 border-b border-zinc-100`.
- **Content:** `p-6`.

## 5. Implementation Notes
- **Tailwind Config:** Ensure `orange` is set as the primary color variable.
- **Icons:** Use `Lucide React` with `text-zinc-400` for inactive and `text-orange-500` for active states.
- **Motion:** Subtle transitions (`duration-200 ease-in-out`) on hover states.