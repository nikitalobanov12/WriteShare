import { Card } from "~/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <Card className="w-full max-w-xl p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="text-muted-foreground text-sm mt-4">
          User settings will appear here.
        </div>
      </Card>
    </div>
  );
} 