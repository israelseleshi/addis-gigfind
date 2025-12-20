import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Overview() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Stat title="Active Gigs" value="3" />
      <Stat title="Pending Applications" value="12" />
      <Stat title="Jobs In-Progress" value="2" />

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p>• New applicant for Plumbing Job</p>
          <p>• Message from Electrician (Bole)</p>
          <Button className="w-full mt-4">Post a New Gig</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
