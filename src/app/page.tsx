import { redirect } from "next/navigation";
import { auth } from "@/auth";
import WorkspacesPage from "./workspaces/page";

export default async function Home() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {session.user.name}
          </h2>
          <p className="text-muted-foreground">
            Start creating and collaborating on documents with real-time editing.
          </p>
        </div>
        <WorkspacesPage />
      </div>
    </div>
  );
}
