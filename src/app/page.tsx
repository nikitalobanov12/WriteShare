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
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">
            Welcome back, {session.user.name}
          </h2>
          <p className="text-muted-foreground">
            Start creating and collaborating on documents with real-time
            editing.
          </p>
        </div>
        <WorkspacesPage />
      </div>
    </div>
  );
}
