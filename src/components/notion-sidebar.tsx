"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronRight,
  Plus,
  Home,
  Settings,
  Users,
  FileText,
  Search,
  Mail,
} from "lucide-react";
import { api } from "~/trpc/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
} from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SignOutButton } from "~/components/sign-out-button";
import { ModeToggle } from "~/components/mode-toggle";

interface Workspace {
  id: number;
  name: string;
}

export function NotionSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: workspaces = [] } = api.workspace.getWorkspaces.useQuery();
  const [searchQuery, setSearchQuery] = React.useState("");

  const navigationItems = [
    {
      title: "Home",
      icon: Home,
      href: "/",
      isActive: pathname === "/",
    },
    {
      title: "Invites",
      icon: Mail,
      href: "/invites",
      isActive: pathname === "/invites",
    },
    {
      title: "Search",
      icon: Search,
      href: "/search",
      isActive: pathname === "/search",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      isActive: pathname === "/settings",
    },
  ];

  const handleWorkspaceClick = (workspaceId: number) => {
    router.push(`/workspaces/${workspaceId}`);
  };

  const handleCreateWorkspace = () => {
    router.push("/workspaces");
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-border border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Notion Clone</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="w-full justify-start"
                  >
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspaces */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Workspaces</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCreateWorkspace}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Create workspace</span>
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((workspace) => (
                <WorkspaceItem
                  key={workspace.id}
                  workspace={workspace}
                  onClick={() => handleWorkspaceClick(workspace.id)}
                  isActive={pathname.startsWith(`/workspaces/${workspace.id}`)}
                />
              ))}
              {workspaces.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleCreateWorkspace}
                    className="text-muted-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first workspace
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-border border-t">
        {session?.user && (
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 p-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={session.user.name ?? ""}
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{session.user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function WorkspaceItem({
  workspace,
  onClick,
  isActive,
}: {
  workspace: Workspace;
  onClick: () => void;
  isActive: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(isActive);

  // Get pages for this workspace
  const { data: pages = [] } = api.page.getWorkspacePages.useQuery(
    { workspaceId: workspace.id },
    {
      enabled: isOpen, // Only fetch when expanded
      refetchOnWindowFocus: false,
    },
  );

  // Filter top-level pages (pages without a parent)
  const topLevelPages = pages.filter((page) => !page.parentId);

  React.useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  const handlePageClick = (pageId: string) => {
    router.push(`/workspaces/${workspace.id}/pages/${pageId}`);
  };

  const handleCreatePage = () => {
    router.push(`/workspaces/${workspace.id}`);
  };

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="group/workspace w-full justify-start"
            isActive={isActive && pathname === `/workspaces/${workspace.id}`}
          >
            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/workspace:rotate-90" />
            <FileText className="h-4 w-4" />
            <span className="truncate">{workspace.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onClick}
                isActive={
                  isActive && pathname === `/workspaces/${workspace.id}`
                }
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4" />
                Overview
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Pages Section */}
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-muted-foreground text-xs font-medium">
                  Pages
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={handleCreatePage}
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Create page</span>
                </Button>
              </div>
            </SidebarMenuItem>

            {/* Pages List */}
            {topLevelPages.length === 0 ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleCreatePage}
                  className="text-muted-foreground w-full justify-start text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Create your first page
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              topLevelPages.map((page) => (
                <PageTreeItem
                  key={page.id}
                  page={page}
                  pages={pages}
                  workspaceId={workspace.id}
                  onPageClick={handlePageClick}
                />
              ))
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

interface PageTreeItemProps {
  page: {
    id: string;
    title: string;
    emoji?: string | null;
    parentId?: string | null;
  };
  pages: Array<{
    id: string;
    title: string;
    emoji?: string | null;
    parentId?: string | null;
  }>;
  workspaceId: number;
  onPageClick: (pageId: string) => void;
}

function PageTreeItem({
  page,
  pages,
  workspaceId,
  onPageClick,
}: PageTreeItemProps) {
  const pathname = usePathname();
  const currentPageId = pathname.split("/").pop();

  // Get child pages for this page
  const childPages = pages.filter((p) => p.parentId === page.id);

  const isActive = currentPageId === page.id;

  if (childPages.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => onPageClick(page.id)}
          className="w-full justify-start pl-8 text-xs"
        >
          <span className="mr-1 text-xs">{page.emoji ?? "📄"}</span>
          <span className="truncate">{page.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/page-collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={
          isActive || childPages.some((child) => child.id === currentPageId)
        }
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            onClick={() => onPageClick(page.id)}
            className="w-full justify-start pl-8 text-xs"
          >
            <ChevronRight className="h-3 w-3 transition-transform" />
            <span className="mr-1 text-xs">{page.emoji ?? "📄"}</span>
            <span className="truncate">{page.title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {childPages.map((childPage) => (
              <PageTreeItem
                key={childPage.id}
                page={childPage}
                pages={pages}
                workspaceId={workspaceId}
                onPageClick={onPageClick}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
