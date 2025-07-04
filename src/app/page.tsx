import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { signOut } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { getUser, getUserPosts } from "~/lib/dal";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const user = await getUser();
  const userPosts = await getUserPosts();

  if (user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Notion Clone</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                         <Image 
                       src={user.image ?? ''} 
                       alt={user.name ?? ''} 
                       width={24}
                       height={24}
                       className="h-6 w-6 rounded-full"
                     />
                    <span>{user.name}</span>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <Button variant="outline" size="sm" type="submit">
                      Sign out
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome to your workspace</h2>
              <p className="text-muted-foreground">
                Start creating and collaborating on documents with real-time editing.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  asChild
                >
                  <Link href="/new">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import
                  </Link>
                </Button>
              </div>

              {/* Recent Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Documents</h3>
                <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
                  <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No documents yet. Create your first document to get started!</p>
                </div>
              </div>

              {/* Debug info during development */}
              {user && (
                <div className="mt-8 p-4 border border-border rounded-lg bg-muted/50">
                  <h3 className="text-sm font-semibold mb-2">Debug Info</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    tRPC Response: {hello ? hello.greeting : "Loading..."}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    User Posts: {userPosts.length} documents
                  </p>
                  <LatestPost />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
