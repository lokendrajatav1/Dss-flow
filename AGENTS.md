# Project Rules & Instructions

All AI agents working on this CRM codebase must strictly follow these instructions:

1. **Architecture & Data Integrity ("Sahi Tarika")**:
   - Always use dedicated PostgreSQL / Prisma models for business entities. No workarounds or dumping core entities into generic buckets (like `CustomField`).
   - Pure dynamic database persistence only — never use mock/dummy fallback data arrays (`sys-0`, `General` hardcoded arrays, `localStorage` mocks).
   - Enforce database-level uniqueness (`@@unique([companyId, name])`) and tenant isolation (`companyId`).
   - Modals must use `createPortal(..., document.body)` and avoid nested forms so submissions never trigger page reloads.

2. **Standard CRM UI & Colors (Match Other Pages)**:
   - Primary Action Buttons (+ Add ...): `#10b981` (Emerald) `hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium`.
   - Refresh Buttons: `#38bdf8` (Sky Blue) `hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md`.
   - Delete Buttons: `#ef4444` (Red) `hover:bg-[#dc2626]`.
   - Action Icons in Tables: Standard `Edit` (blue hover `hover:text-blue-600 hover:bg-blue-50`) and `Trash2` (red hover `hover:text-red-600 hover:bg-red-50`), centered in cell.
   - Table Headers: `#f8fafc` clean gray with uppercase tracking-wider text.
   - Avoid visual clutter: no extra color pickers, no decorative badge clutter, and no oversized metric cards on simple listing pages.
