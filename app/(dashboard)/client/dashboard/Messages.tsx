import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";


export function Messages() {
return (
<div className="grid md:grid-cols-3 gap-4">
<Card>
<CardHeader>
<CardTitle>Inbox</CardTitle>
</CardHeader>
<CardContent className="space-y-2">
<p>• John (Plumber)</p>
<p>• Sara (Painter)</p>
</CardContent>
</Card>


<Card className="md:col-span-2">
<CardHeader>
<CardTitle>Chat</CardTitle>
</CardHeader>
<CardContent className="space-y-2">
<div className="h-40 border rounded-md p-2">Conversation…</div>
<Textarea placeholder="Negotiate price / location" />
<Button>Send</Button>
</CardContent>
</Card>
</div>
);
}