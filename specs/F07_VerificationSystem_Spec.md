# Feature Specification 07: Verification System

## 1. Executive Summary
Implements the ID verification system for freelancers. Includes document upload, status tracking, and admin approval workflow.

## 2. Business Rules

### 2.1 AGF-BR-101 (Kebele/ID Mandate)
- Freelancers must upload ID to apply for gigs
- Verification status must be 'verified' before applying
- Verification status: unverified → pending → verified/rejected

### 2.2 Document Types
- Kebele ID (primary)
- Passport
- Student ID (for student discount/trust)

### 2.3 File Requirements
- Max file size: 5MB
- Allowed types: JPG, PNG, PDF
- Storage bucket: verification_docs (private)

## 3. Database Schema

### 3.1 verification_documents table
```sql
CREATE TABLE public.verification_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  front_image_url text NOT NULL,
  back_image_url text,
  submitted_at timestamp with time zone DEFAULT timezone('utc', now()),
  admin_notes text,
  status verification_status DEFAULT 'pending'
);

-- RLS Policies
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON verification_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents" ON verification_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents" ON verification_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update documents" ON verification_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### 3.2 Storage Buckets
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification_docs', 'verification_docs', false);

-- Policies
CREATE POLICY "Users can upload their own ID" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification_docs' AND 
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Admins can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification_docs' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## 4. Zod Validation Schema

```typescript
const verificationSchema = z.object({
  documentType: z.enum(['kebele', 'passport', 'student_id']),
  frontImage: z.instanceof(File),
  backImage: z.instanceof(File).optional(),
})

type VerificationFormValues = z.infer<typeof verificationSchema>
```

## 5. Server Actions (lib/actions/verification.ts)

### 5.1 uploadVerificationDocument(values)
```typescript
export async function uploadVerificationDocument(values: VerificationFormValues) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Check if already has pending verification
  const { data: existing } = await supabase
    .from('verification_documents')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'verified'])
    .single()
  
  if (existing?.status === 'pending') {
    return { error: "You already have a pending verification" }
  }
  
  if (existing?.status === 'verified') {
    return { error: "You are already verified" }
  }
  
  // Upload front image
  const frontFileName = `${user.id}/verification/front-${Date.now()}`
  const { error: uploadError } = await supabase.storage
    .from('verification_docs')
    .upload(frontFileName, values.frontImage)
  
  if (uploadError) {
    return { error: "Failed to upload front image" }
  }
  
  let backFileUrl: string | null = null
  if (values.backImage) {
    const backFileName = `${user.id}/verification/back-${Date.now()}`
    const { error: backUploadError } = await supabase.storage
      .from('verification_docs')
      .upload(backFileName, values.backImage)
    
    if (!backUploadError) {
      const { data: backData } = supabase.storage
        .from('verification_docs')
        .getPublicUrl(backFileName)
      backFileUrl = backData.publicUrl
    }
  }
  
  // Get front image URL
  const { data: frontData } = supabase.storage
    .from('verification_docs')
    .getPublicUrl(frontFileName)
  
  // Create verification record
  const { error: insertError } = await supabase
    .from('verification_documents')
    .insert({
      user_id: user.id,
      document_type: values.documentType,
      front_image_url: frontData.publicUrl,
      back_image_url: backFileUrl,
      status: 'pending',
    })
  
  if (insertError) {
    return { error: insertError.message }
  }
  
  // Update profile status
  await supabase
    .from('profiles')
    .update({ verification_status: 'pending' })
    .eq('id', user.id)
  
  revalidatePath('/profile')
  return { success: true }
}
```

### 5.2 getVerificationStatus(userId)
```typescript
export async function getVerificationStatus(userId: string) {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', userId)
    .single()
  
  const { data: document } = await supabase
    .from('verification_documents')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()
  
  return {
    status: profile?.verification_status || 'unverified',
    document: document || null,
  }
}
```

### 5.3 adminApproveVerification(documentId)
```typescript
export async function adminApproveVerification(documentId: string) {
  const supabase = createClient()
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  if (adminProfile?.role !== 'admin') {
    return { error: "Not authorized" }
  }
  
  // Get document to find user
  const { data: document } = await supabase
    .from('verification_documents')
    .select('user_id')
    .eq('id', documentId)
    .single()
  
  // Update document status
  await supabase
    .from('verification_documents')
    .update({ status: 'verified' })
    .eq('id', documentId)
  
  // Update user profile
  await supabase
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', document?.user_id)
  
  // Create notification
  await createNotification(
    document?.user_id, 
    'verification_approved',
    'Your ID verification has been approved!'
  )
  
  revalidatePath('/admin/verifications')
  return { success: true }
}
```

### 5.4 adminRejectVerification(documentId, reason)
```typescript
export async function adminRejectVerification(documentId: string, reason: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  if (adminProfile?.role !== 'admin') {
    return { error: "Not authorized" }
  }
  
  const { data: document } = await supabase
    .from('verification_documents')
    .select('user_id')
    .eq('id', documentId)
    .single()
  
  await supabase
    .from('verification_documents')
    .update({ status: 'rejected', admin_notes: reason })
    .eq('id', documentId)
  
  await supabase
    .from('profiles')
    .update({ verification_status: 'rejected' })
    .eq('id', document?.user_id)
  
  await createNotification(
    document?.user_id,
    'verification_rejected',
    `Your ID verification was rejected. Reason: ${reason}`
  )
  
  revalidatePath('/admin/verifications')
  return { success: true }
}
```

## 6. UI Components

### 6.1 VerificationUpload (src/components/verification/verification-upload.tsx)
**Features:**
- Document type selection (radio/select)
- Front image upload (drag & drop)
- Back image upload (optional)
- Image preview
- File validation (size, type)
- Submit button
- Progress indicator

### 6.2 VerificationStatus (src/components/verification/verification-status.tsx)
**Features:**
- Status badge (unverified/pending/verified/rejected)
- Status description text
- Action button based on status
- Show document preview if available

### 6.3 VerificationWarning (src/components/verification/verification-warning.tsx)
**Features:**
- Warning message for unverified users
- Link to verification page
- Only shown when trying to apply for gigs

### 6.4 AdminVerificationList (src/components/verification/admin-verification-list.tsx)
**Features:**
- List of pending verifications
- Document preview thumbnails
- User info display
- Approve/Reject buttons
- Reject reason input

## 7. Pages

### 7.1 Verification Page
**Location:** src/app/(main)/freelancer/verification/page.tsx
**Features:**
- Render VerificationStatus
- Render VerificationUpload (if not verified)
- Show verification requirements
- Document guidelines

### 7.2 Admin Verifications Dashboard
**Location:** src/app/(main)/admin/verifications/page.tsx
**Features:**
- Render AdminVerificationList
- Filter by status (pending, verified, rejected)
- Search by user email
- Stats: pending count, approved today

### 7.3 Admin Verification Detail
**Location:** src/app/(main)/admin/verifications/[id]/page.tsx
**Features:**
- Full document preview
- User profile info
- Approve/Reject buttons
- Reject reason input
- History of previous verifications

## 8. Implementation Checklist

- [ ] Create src/lib/validations/verification.ts
- [ ] Create src/lib/actions/verification.ts
- [ ] Create SQL for storage bucket and policies
- [ ] Create src/components/verification/verification-upload.tsx
- [ ] Create src/components/verification/verification-status.tsx
- [ ] Create src/components/verification/verification-warning.tsx
- [ ] Create src/components/verification/admin-verification-list.tsx
- [ ] Create /freelancer/verification/page.tsx
- [ ] Create /admin/verifications/page.tsx
- [ ] Create /admin/verifications/[id]/page.tsx
- [ ] Test document upload
- [ ] Test file validation
- [ ] Test status updates
- [ ] Test admin approval workflow
- [ ] Test notification integration

## 9. Testing Strategy

### 9.1 E2E Tests (Cypress)
- Test document upload with valid files
- Test file size validation
- Test file type validation
- Test optional back image
- Test status display
- Test admin approval
- Test admin rejection with reason
- Test verification warning on apply

## 10. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Onboarding Spec:** specs/F02_Onboarding_Spec.md
- **Freelancer Features Spec:** specs/F04_FreelancerFeatures_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 7)

## 11. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
