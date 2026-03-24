---
description: How to perform accurate facial verification for residents.
---

### RULE: SMART BARANGAY-SCOPED CONTENT (RESIDENTS & ADMIN)

1.  **Strict Content Isolation**:
    *   **Landing Page (No Barangay Selector)**: ONLY show content (Announcements, News, Events, Projects, Jobs, etc.) where `barangay` is `null` or empty.
    *   **Barangay Context (Search Parameter `?barangay=Name` in URL)**: ONLY show content specifically tagged with that `barangay`.
2.  **Server-Side Scoping (Performance Rule)**:
    *   Always fetch content using Prisma `where` clause for the specific barangay or `null` (General). 
    *   NEVER fetch all data and then filter on the client side for landing page sections. This ensures `take: X` limits are accurate for the current view.
3.  **Automatic Admin Tagging**:
    *   All content (Announcements, News, etc.) created by a `BARANGAY_ADMIN` must be automatically tagged with their `managedBarangay` using [getSessionBarangay()](cci:1://file:///c:/Website%20Project/agno-portal/app/admin/actions.ts:15:0-23:1).
    *   Content created by an `ADMIN` (Super Admin) defaults to no-barangay (General LGU) but should allow selecting a specific barangay if needed.
4.  **UI Consistency**:
    *   When a specific barangay is selected, the URL must reflect it (e.g., `location.pathname?barangay=Name`).
    *   Always provide a "Back to Landing Page" option in the community selector to clear the `barangay` search parameter.
