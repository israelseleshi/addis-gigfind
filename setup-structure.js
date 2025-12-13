const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

// The strict hierarchy defined in our previous discussion
const folders = [
  // Public
  'app/(public)/about',
  'app/(public)/privacy',
  'app/(public)/search/[id]',
  
  // Auth (Section 3.2.1.A.2)
  'app/(auth)/login',
  'app/(auth)/register/client',
  'app/(auth)/register/freelancer',
  'app/(auth)/verify',

  // Client Dashboard (Section 3.2.1.C)
  'app/(dashboard)/client/dashboard',
  'app/(dashboard)/client/post-gig/confirmation',
  'app/(dashboard)/client/my-jobs/[gigId]/applicants',
  'app/(dashboard)/client/my-jobs/[gigId]/complete',
  'app/(dashboard)/client/profile',

  // Freelancer Dashboard (Section 3.2.1.B)
  'app/(dashboard)/freelancer/dashboard',
  'app/(dashboard)/freelancer/find-work/[gigId]/apply',
  'app/(dashboard)/freelancer/my-applications',
  'app/(dashboard)/freelancer/kyc',
  'app/(dashboard)/freelancer/profile/edit',

  // Communication & Admin
  'app/(dashboard)/chat/[conversationId]',
  'app/(dashboard)/admin/dashboard',
  'app/(dashboard)/admin/users',
  'app/(dashboard)/admin/verifications',
  'app/(dashboard)/admin/reports',

  // Components & Libs
  'components/ui', // Already exists via shadcn but ensures consistency
  'components/auth',
  'components/gig',
  'components/application',
  'components/profile',
  'components/chat',
  'hooks',
  'lib/validations',
  'types',
];

// Dummy page content to prevent Next.js build errors
const defaultPageContent = (name) => `
export default function ${name}Page() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">${name} Page</h1>
      <p className="text-gray-500">Implemented based on SRS Requirement.</p>
    </div>
  );
}
`;

const defaultLayoutContent = (name) => `
export default function ${name}Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="h-full w-full">
      {/* Sidebar or Nav Logic would go here */}
      {children}
    </section>
  );
}
`;

console.log('🚀 Starting Intelligent Folder Structure Generation...');

folders.forEach((folderPath) => {
  const fullPath = path.join(srcPath, folderPath);
  
  // 1. Create the Directory
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created: ${folderPath}`);
  }

  // 2. Add a basic page.tsx to ensure the route is valid
  // We don't add page.tsx to 'components' or 'lib' folders
  if (folderPath.startsWith('app')) {
    const pagePath = path.join(fullPath, 'page.tsx');
    if (!fs.existsSync(pagePath)) {
      const dirName = path.basename(folderPath).replace(/\[|\]/g, '').replace(/-/g, ' ');
      const componentName = dirName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      
      fs.writeFileSync(pagePath, defaultPageContent(componentName));
    }
  }
});

// 3. Create Specific Layouts
const layouts = [
    'app/(dashboard)/client',
    'app/(dashboard)/freelancer',
    'app/(dashboard)/admin',
    'app/(auth)'
];

layouts.forEach((layoutPath) => {
    const fullPath = path.join(srcPath, layoutPath, 'layout.tsx');
    if (!fs.existsSync(fullPath)) {
         const componentName = path.basename(layoutPath).charAt(0).toUpperCase() + path.basename(layoutPath).slice(1);
        fs.writeFileSync(fullPath, defaultLayoutContent(componentName));
        console.log(`📝 Created Layout: ${layoutPath}/layout.tsx`);
    }
});

console.log('🎉 Project Structure Generation Complete. You are ready to code!');