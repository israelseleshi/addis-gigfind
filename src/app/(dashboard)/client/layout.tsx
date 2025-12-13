
export default function ClientLayout({
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
