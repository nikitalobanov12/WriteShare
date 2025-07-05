import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import WorkspacesPage from './page';

// Create hoisted mocks to avoid initialization issues
const mockTrpcApi = vi.hoisted(() => ({
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
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
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
      {children}
    </QueryClientProvider>
  );
};

describe('WorkspacesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockTrpcApi.workspace.getWorkspaces.useQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    mockTrpcApi.workspace.createWorkspace.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });
    mockTrpcApi.workspace.inviteUser.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });

    render(<WorkspacesPage />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Loading workspaces...')).toBeInTheDocument();
  });

  it('renders workspaces when data is available', () => {
    const mockWorkspaces = [
      { id: 1, name: 'Test Workspace 1' },
      { id: 2, name: 'Test Workspace 2' },
    ];

    mockTrpcApi.workspace.getWorkspaces.useQuery.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockTrpcApi.workspace.createWorkspace.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });
    mockTrpcApi.workspace.inviteUser.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });

    render(<WorkspacesPage />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Test Workspace 1')).toBeInTheDocument();
    expect(screen.getByText('Test Workspace 2')).toBeInTheDocument();
  });

  it('opens create workspace dialog when New Workspace button is clicked', async () => {
    mockTrpcApi.workspace.getWorkspaces.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockTrpcApi.workspace.createWorkspace.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });
    mockTrpcApi.workspace.inviteUser.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });

    render(<WorkspacesPage />, { wrapper: TestWrapper });
    
    const newWorkspaceButton = screen.getByText('New Workspace');
    fireEvent.click(newWorkspaceButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Workspace')).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', () => {
    mockTrpcApi.workspace.getWorkspaces.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch workspaces'),
      refetch: vi.fn(),
    });
    mockTrpcApi.workspace.createWorkspace.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });
    mockTrpcApi.workspace.inviteUser.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });

    render(<WorkspacesPage />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Failed to fetch workspaces')).toBeInTheDocument();
  });

  it('shows empty state when no workspaces exist', () => {
    mockTrpcApi.workspace.getWorkspaces.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockTrpcApi.workspace.createWorkspace.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });
    mockTrpcApi.workspace.inviteUser.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      status: 'idle',
    });

    render(<WorkspacesPage />, { wrapper: TestWrapper });
    
    expect(screen.getByText('No workspaces yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first workspace to get started')).toBeInTheDocument();
  });
}); 