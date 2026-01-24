export default function DashboardLoading() {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
          <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
          <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
          <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
