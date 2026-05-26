# TODO - Refactor Users Admin UI Controls

- [ ] Update toolbar in `app/admin/users/UsersPage.tsx`:
  - [ ] Make `All Roles` select width exactly match Search input: `w-full sm:w-[280px] lg:w-[350px]`
  - [ ] Make `All Verification` select width exactly match Search input: `w-full sm:w-[280px] lg:w-[350px]`
  - [ ] Ensure identical height (`h-12`), border radius (`rounded-xl`), typography/alignment, and consistent icon+text spacing
  - [ ] Remove uneven wrapper sizing (e.g., `sm:w-auto`, `sm:w-[350px]` on selects)
- [ ] Update Role dropdown styling in modals:
  - [ ] `app/admin/users/AddUserModal.tsx` Role `SelectTrigger` must match modal `Input` styling exactly
  - [ ] `app/admin/users/EditUserModal.tsx` Role `SelectTrigger` must match modal `Input` styling exactly
  - [ ] Ensure dropdowns align perfectly with input fields (width + trigger styles)
- [x] Run lint/tests and/or build to verify no TS/JSX errors
- [ ] Manual responsive check (mobile + desktop) for toolbar and modals
