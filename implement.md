# Semester 1 MVP Implementation Plan

This document outlines the current status of the seven core features required for the Semester 1 MVP and the implementation plan for the remaining work.

## Feature Status

| Feature                    | Status                    | Notes                                                                                             |
| -------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| 1. User Registration & Login | ✅ **Implemented**          | `registerClient`, `registerFreelancer`, and `loginUser` actions are functional using Supabase Auth. |
| 2. Manage Profile (Basic)  | ✅ **Implemented**          | Users can edit their bio and upload a profile picture via the settings pages.                     |
| 3. Post Gig (CRUD)         | ✅ **Implemented**          | The form at `/client/gigs/create` successfully inserts new gigs into the Supabase database.       |
| 4. Browse & Search Gigs    | ✅ **Implemented**          | The `/freelancer/find-work` page fetches and displays all open gigs with search and filter.       |
| 5. Apply for Gig           | ⚠️ **Partially Implemented** | The UI exists, but the form submission does not create an `applications` record in the database.    |
| 6. View Applications & Hire| ✅ **Implemented**          | Clients can view applicants for their gigs and use the `handleAccept` function to hire.         |
| 7. Mark Completed          | ❌ **Not Implemented**      | There is no UI or backend logic for a client or freelancer to mark a gig as completed.            |

---

## Implementation Roadmap

To complete the MVP, the following two features must be implemented.

### 1. Complete "Apply for Gig" Feature

**Objective:** Connect the "Apply Now" modal to a server action that creates an application record in the Supabase `applications` table, including validation and security checks.

#### User Flow

1.  A logged-in freelancer navigates to a specific gig's detail page.
2.  They click the "Apply Now" button, which opens a modal dialog.
3.  The freelancer enters their proposed bid amount and a cover letter into the modal's form.
4.  Upon clicking "Submit Application," the frontend calls a server action.
5.  The server action validates the submitted data and performs security checks.
6.  A new record is inserted into the `applications` table in Supabase.
7.  The modal closes, and a success toast notification is displayed. If any step fails, an error toast is shown.

#### Frontend Tasks (`@/src/app/(dashboard)/freelancer/find-work/[gigId]/page.tsx`)

1.  **State Management:**
    *   Create state variables for `coverNote` (string) and `bidAmount` (string).
    *   Add a state for `isSubmitting` (boolean) to manage the loading state of the submission button.
2.  **Modal UI Enhancement:**
    *   Inside the `<DialogContent>`, add a form structure.
    *   Include a `<Label>` and `<Textarea>` for the cover note, binding it to the `coverNote` state.
    *   Include a `<Label>` and `<Input type="number">` for the bid amount, binding it to the `bidAmount` state.
3.  **Submission Logic:**
    *   Create an `handleApplySubmit` async function to be called by the "Submit Application" button.
    *   This function will set `isSubmitting` to `true`.
    *   It will call a new server action, `applyForGig`, passing an object with `gigId`, `coverNote`, and `bidAmount`.
    *   It will handle the server action's response, displaying success or error toasts via `sonner`.
    *   On success, it will close the modal (`setIsApplyModalOpen(false)`).
    *   It will set `isSubmitting` to `false` in a `finally` block.

#### Backend Tasks

1.  **Create Server Action File (`@/src/lib/actions/applications.ts`):**
    *   Create a new file to house application-related server actions.
2.  **Define Zod Schema:**
    *   Create an `applicationSchema` using Zod for validation:
        *   `gigId`: `z.string().uuid()`
        *   `coverNote`: `z.string().min(20, 'Cover note must be at least 20 characters.')`
        *   `bidAmount`: `z.coerce.number().positive('Bid amount must be a positive number.')`
3.  **Create `applyForGig` Server Action:**
    *   Define an `async function applyForGig(data: { gigId: string; coverNote: string; bidAmount: number })`.
    *   Get the current user session using the Supabase server client. If no user, return an error.
    *   Validate the input data against `applicationSchema`.
    *   **Security Check 1 (Already Applied):** Query the `applications` table to check for an existing record with the same `gig_id` and `freelancer_id`. If one exists, return an error.
    *   **Security Check 2 (Max Applications):** Count the user's applications where `status` is 'pending'. If the count is 5 or more, return an error.
    *   **Database Insert:** Insert a new row into the `applications` table with `gig_id`, `freelancer_id` (from `user.id`), `bid_amount`, `cover_note`, and a hardcoded `status` of `pending`.
    *   If successful, `revalidatePath` for relevant pages (e.g., the client's applicants page) and return a success message.

#### Supabase SQL & RLS Policies

The following SQL should be executed in the Supabase SQL Editor to secure the `applications` table.

1.  **Enable RLS on the `applications` table:**
    ```sql
    ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
    ```

2.  **INSERT Policy:** Allows freelancers to apply for gigs.
    ```sql
    -- Name: "Freelancers can create their own applications."
    CREATE POLICY "allow_freelancer_insert"
    ON public.applications
    FOR INSERT
    WITH CHECK (
      -- The user must have the 'freelancer' role in their profile
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'freelancer' AND
      -- The freelancer_id in the new application must match the user's own ID
      (freelancer_id = auth.uid())
    );
    ```

3.  **SELECT Policy:** Allows users to see applications relevant to them.
    ```sql
    -- Name: "Users can view applications related to them."
    CREATE POLICY "allow_user_select"
    ON public.applications
    FOR SELECT
    USING (
      -- Freelancers can see their own applications
      ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'freelancer' AND freelancer_id = auth.uid() ) OR
      -- Clients can see applications for their own gigs
      ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client' AND gig_id IN (SELECT id FROM public.gigs WHERE client_id = auth.uid()) )
    );
    ```

4.  **UPDATE Policy:** Allows users to update the status of applications.
    ```sql
    -- Name: "Users can update application status."
    CREATE POLICY "allow_user_update"
    ON public.applications
    FOR UPDATE
    USING (
      -- Clients can update the status of applications for their gigs
      ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client' AND gig_id IN (SELECT id FROM public.gigs WHERE client_id = auth.uid()) ) OR
      -- Freelancers can withdraw their own pending applications
      ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'freelancer' AND freelancer_id = auth.uid() AND status = 'pending' )
    );
    ```

### 2. Implement "Mark Completed" Feature

**Objective:** Allow a client to mark an `assigned` or `in_progress` gig as `completed`.

**Frontend Tasks:**

1.  **Add Button:** In `@/src/app/(dashboard)/client/my-jobs/page.tsx`, add a "Mark as Completed" button to the card of any gig where the status is `assigned` or `in_progress`.
2.  **Create Server Action Call:** Wire the button's `onClick` event to a new server action, passing the `gig.id`.

**Backend Tasks:**

1.  **Create Server Action:** In an appropriate actions file (e.g., `@/src/lib/actions/gigs.ts`), create a `markGigAsCompleted` function.
    *   The function will take a `gigId` as an argument.
    *   It will verify that the currently authenticated user is the `client_id` associated with the gig to prevent unauthorized updates.
    *   It will update the `status` of the specified gig to `completed` in the `gigs` table.
2.  **Supabase RLS Policies:** Update the RLS policies for the `gigs` table.
    *   **UPDATE:** Ensure a policy exists that allows a user to update a gig only if their `auth.uid()` matches the `client_id` of the gig.

---

## Supabase Backend Considerations

*   **Tables:** No new tables are required for the Semester 1 MVP. The existing `profiles`, `gigs`, and `applications` tables are sufficient.
*   **Functions/Triggers:** The existing `on_auth_user_created` trigger is sufficient for user registration. No new database functions or triggers are immediately necessary for the remaining MVP features. All logic can be handled within server actions and RLS policies.
