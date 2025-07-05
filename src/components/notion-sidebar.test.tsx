import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { NotionSidebar } from './notion-sidebar';
import { SidebarProvider } from './ui/sidebar';

// Create hoisted mocks to avoid initialization issues
const mockTrpcApi = vi.hoisted(() => ({
  workspace: {
    getWorkspaces: {
      useQuery: vi.fn(),
    },
  },
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    },
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the tRPC API
vi.mock('~/trpc/react', () => ({
  api: mockTrpcApi,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={null}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

describe('NotionSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrpcApi.workspace.getWorkspaces.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  it('renders the sidebar with main navigation', () => {
    render(<NotionSidebar />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Notion Clone')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows workspaces section', () => {
    render(<NotionSidebar />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Workspaces')).toBeInTheDocument();
  });

  it('shows create workspace option when no workspaces exist', () => {
    render(<NotionSidebar />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Create your first workspace')).toBeInTheDocument();
  });

  it('displays workspaces when available', () => {
    const mockWorkspaces = [
      { id: 1, name: 'Test Workspace 1' },
      { id: 2, name: 'Test Workspace 2' },
    ];

    mockTrpcApi.workspace.getWorkspaces.useQuery.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
      error: null,
    });

    render(<NotionSidebar />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Test Workspace 1')).toBeInTheDocument();
    expect(screen.getByText('Test Workspace 2')).toBeInTheDocument();
  });

  it('shows user profile in footer', () => {
    render(<NotionSidebar />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
}); 