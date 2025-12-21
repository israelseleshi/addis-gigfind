import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function HiredPage() {
return (
<Card>
<CardHeader>
<CardTitle>Active Contracts</CardTitle>
</CardHeader>
<CardContent>
<div className="border p-4 rounded-lg space-y-2">
<p className="font-medium">Electrician – Bole</p>
<Button size="sm">Mark Job Completed</Button>
</div>
</CardContent>
</Card>
);
}
