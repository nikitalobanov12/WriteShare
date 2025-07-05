import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { 
  createMockTrpcApi, 
  TestWrapper, 
  renderWithProviders,
  defaultMockWorkspace,
  defaultMockMutation
} from './test-utils';

// Simple test component
const TestComponent = () => <div>Test Component</div>;

// Component that uses sidebar context
const SidebarTestComponent = () => {
  return (
    <div>
      <span>Sidebar Test Component</span>
    </div>
  );
};

describe('Test Utils', () => {
  it('creates mock tRPC API with correct structure', () => {
    const mockApi = createMockTrpcApi();
    
    expect(mockApi).toHaveProperty('workspace');
    expect(mockApi.workspace).toHaveProperty('getWorkspaces');
    expect(mockApi.workspace).toHaveProperty('createWorkspace');
    expect(mockApi.workspace).toHaveProperty('inviteUser');
  });

  it('renders component with TestWrapper', () => {
    render(<TestComponent />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('renders component with sidebar provider', () => {
    const WrapperWithSidebar = ({ children }: { children: React.ReactNode }) => (
      <TestWrapper withSidebar={true}>{children}</TestWrapper>
    );
    
    render(<SidebarTestComponent />, { wrapper: WrapperWithSidebar });
    
    expect(screen.getByText('Sidebar Test Component')).toBeInTheDocument();
  });

  it('renders component using renderWithProviders', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('renders component with sidebar using renderWithProviders', () => {
    renderWithProviders(<SidebarTestComponent />, { withSidebar: true });
    
    expect(screen.getByText('Sidebar Test Component')).toBeInTheDocument();
  });

  it('provides default mock values', () => {
    expect(defaultMockWorkspace).toEqual({
      data: [],
      isLoading: false,
      error: null,
      refetch: expect.any(Function) as unknown,
    });

    expect(defaultMockMutation).toEqual({
      mutateAsync: expect.any(Function) as unknown,
      status: 'idle',
    });
  });

  it('default mock functions are vitest mocks', () => {
    expect(vi.isMockFunction(defaultMockWorkspace.refetch)).toBe(true);
    expect(vi.isMockFunction(defaultMockMutation.mutateAsync)).toBe(true);
  });
}); 