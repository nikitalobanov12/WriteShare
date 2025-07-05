import Link from "next/link";
import { redirect } from "next/navigation";

import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { auth } from "@/auth";
import { SignOutButton } from "~/components/sign-out-button";
import { ModeToggle } from "~/components/mode-toggle";

export default async function Home() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="bg-background min-h-screen">
        {/* Header */}
        <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Notion Clone</h1>
            </div>

            <div className="flex items-center gap-4">
              <ModeToggle />

              {session?.user && (
                <>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Image
                      src={session.user.image ?? ""}
                      alt={session.user.name ?? ""}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full"
                    />
                    <span>{session.user.name}</span>
                  </div>
                  <SignOutButton />
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold">
                Welcome to your workspace
              </h2>
              <p className="text-muted-foreground">
                Start creating and collaborating on documents with real-time
                editing.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  asChild
                >
                  <Link href="/new">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    New Document
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  asChild
                >
                  <Link href="/templates">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Templates
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  asChild
                >
                  <Link href="/import">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Import
                  </Link>
                </Button>
              </div>

              {/* Recent Documents */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">Recent Documents</h3>
                <div className="border-border text-muted-foreground rounded-lg border p-8 text-center">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>
                    No documents yet. Create your first document to get started!
                  </p>
                </div>
              </div>

              {/* Debug info during development */}
              {/* {session?.user && (
                <div className="mt-8 p-4 border border-border rounded-lg bg-muted/50">
                  <h3 className="text-sm font-semibold mb-2">Debug Info</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    tRPC Response: {hello ? hello.greeting : "Loading..."}
                  </p>
                  <LatestPost />
                </div>
              )} */}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
