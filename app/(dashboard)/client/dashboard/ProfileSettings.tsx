import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export function ProfileSettings() {
return (
<Card>
<CardHeader>
<CardTitle>Profile & Settings</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
<Input placeholder="Full Name" />
<Input placeholder="Phone Number" />
<Input placeholder="Neighborhood (e.g. Bole)" />
<Button>Save</Button>


<div className="border-t pt-4">
<p className="font-medium">History</p>
<p className="text-sm text-muted-foreground">
8 jobs completed • ETB 25,000 spent (est.)
</p>
</div>
</CardContent>
</Card>
);
}