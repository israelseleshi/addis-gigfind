import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


export default function GigsPage() {
return (
<Card>
<CardHeader>
<CardTitle>My Gigs</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
{[
{ title: "House Painting", status: "Open" },
{ title: "Office Wiring", status: "Assigned" },
].map((gig) => (
<div key={gig.title} className="flex justify-between border p-4 rounded-lg">
<div>
<p className="font-medium">{gig.title}</p>
<Badge>{gig.status}</Badge>
</div>
<div className="space-x-2">
<Button size="sm" variant="outline">Edit</Button>
<Button size="sm" variant="destructive">Close</Button>
</div>
</div>
))}
</CardContent>
</Card>
);
}
