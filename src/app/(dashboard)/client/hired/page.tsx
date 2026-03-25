import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function HiredPage() {
return (
<div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Active Contracts</h1>
<Card className="p-3 sm:p-4 md:p-5 lg:p-6">
  <CardHeader className="p-0 pb-3 sm:pb-4 md:pb-5">
    <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Active Contracts</CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    <div className="border border-zinc-200 p-3 sm:p-4 md:p-5 rounded-lg space-y-2 sm:space-y-3">
      <p className="font-medium text-sm sm:text-base md:text-lg">Electrician – Bole</p>
      <Button size="sm" className="text-xs sm:text-sm w-full sm:w-auto">Mark Job Completed</Button>
    </div>
  </CardContent>
</Card>
</div>
);
}
