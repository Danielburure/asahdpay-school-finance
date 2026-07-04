## Problem

On the sign-in form, a wrong password calls `toast.error(error.message)` (which returns "Invalid login credentials" from the backend), but nothing appears on screen. The reason is that no `<Toaster />` component is mounted anywhere in the app — `src/routes/__root.tsx` never renders one — so every `toast.*` call in the app is silently discarded. The submit button just re-enables, making it look like the login was "refused" with no reason.

## Fix

Mount the Sonner toaster once at the root so all `toast.error` / `toast.success` calls render, including the auth page.

### Change: `src/routes/__root.tsx`
- Import `Toaster` from `@/components/ui/sonner`.
- Render `<Toaster richColors position="top-center" />` inside `RootComponent`, next to `<Outlet />` (still inside `QueryClientProvider`).

That single change makes the wrong-password message ("Invalid login credentials") visibly appear on the auth page, and also fixes every other silent toast across the dashboard.

No changes to auth logic, Supabase, or business code.