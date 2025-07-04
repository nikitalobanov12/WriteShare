
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional class names', () => {
    expect(cn('class1', { 'class2': true, 'class3': false })).toBe('class1 class2');
  });

  it('should overwrite conflicting class names', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn(null, undefined, false, '')).toBe('');
  });
}); 