"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Dashboard Error</h2>
        <p className="text-gray-600 mb-6">
          Something went wrong while loading your client dashboard.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
