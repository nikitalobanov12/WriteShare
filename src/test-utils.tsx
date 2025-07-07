import { vi } from "vitest";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "~/components/ui/sidebar";
import React from "react";

// Common mock patterns for tRPC
export const createMockTrpcApi = () =>
  vi.hoisted(() => ({
    workspace: {
      getWorkspaces: {
        useQuery: vi.fn(),
      },
      createWorkspace: {
        useMutation: vi.fn(),
      },
      inviteUser: {
        useMutation: vi.fn(),
      },
    },
    // Add more API endpoints as needed
  }));

// Mock Next.js navigation
export const mockNextNavigation = () => {
  vi.mock("next/navigation", () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  }));
};

// Mock NextAuth
export const mockNextAuth = (
  userData = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.jpg",
  },
) => {
  vi.mock("next-auth/react", () => ({
    useSession: () => ({
      data: {
        user: userData,
      },
    }),
    SessionProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }));
};

// Test wrapper for components that need providers
interface TestWrapperProps {
  children: React.ReactNode;
  withSidebar?: boolean;
}

export const TestWrapper = ({
  children,
  withSidebar = false,
}: TestWrapperProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  let content = (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={null}>{children}</SessionProvider>
    </QueryClientProvider>
  );

  if (withSidebar) {
    content = (
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <SidebarProvider>{children}</SidebarProvider>
        </SessionProvider>
      </QueryClientProvider>
    );
  }

  return content;
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions & { withSidebar?: boolean },
) => {
  const { withSidebar = false, ...renderOptions } = options ?? {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper withSidebar={withSidebar}>{children}</TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Default mock return values
export const defaultMockWorkspace = {
  data: [],
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

export const defaultMockMutation = {
  mutateAsync: vi.fn(),
  status: "idle" as const,
};
