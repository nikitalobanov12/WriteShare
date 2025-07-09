import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";

export default function SearchPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <Card className="w-full max-w-xl p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Search</h1>
        <Input placeholder="Type to search..." aria-label="Search" />
        <div className="text-muted-foreground text-sm mt-4">
          Search results will appear here.
        </div>
      </Card>
    </div>
  );
} 