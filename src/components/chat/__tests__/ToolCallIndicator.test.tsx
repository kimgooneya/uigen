import { test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ToolCallIndicator } from '../ToolCallIndicator';

afterEach(() => {
  cleanup();
});

test('displays "Creating filename" for str_replace_editor create command', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'call' as const,
    args: {
      command: 'create',
      path: 'src/components/Button.tsx'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Creating Button.tsx')).toBeDefined();
});

test('displays "Editing filename" for str_replace_editor str_replace command', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'call' as const,
    args: {
      command: 'str_replace',
      path: 'src/utils/helpers.ts'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Editing helpers.ts')).toBeDefined();
});

test('displays "Reading filename" for str_replace_editor view command', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'call' as const,
    args: {
      command: 'view',
      path: 'package.json'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Reading package.json')).toBeDefined();
});

test('displays "Adding to filename" for str_replace_editor insert command', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'call' as const,
    args: {
      command: 'insert',
      path: 'src/config/index.ts'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Adding to index.ts')).toBeDefined();
});

test('displays "Renaming old to new" for file_manager rename command', () => {
  const tool = {
    toolName: 'file_manager',
    state: 'call' as const,
    args: {
      command: 'rename',
      old_path: 'src/old-component.tsx',
      new_path: 'src/new-component.tsx'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Renaming old-component.tsx to new-component.tsx')).toBeDefined();
});

test('displays "Deleting filename" for file_manager delete command', () => {
  const tool = {
    toolName: 'file_manager',
    state: 'call' as const,
    args: {
      command: 'delete',
      path: 'src/unused-file.ts'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Deleting unused-file.ts')).toBeDefined();
});

test('displays formatted tool name for unknown tools', () => {
  const tool = {
    toolName: 'custom_api_tool',
    state: 'call' as const,
    args: {}
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Custom Api Tool')).toBeDefined();
});

test('shows loading spinner for in-progress tools', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'call' as const,
    args: {
      command: 'create',
      path: 'test.tsx'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  
  const spinner = document.querySelector('.animate-spin');
  expect(spinner).toBeDefined();
  expect(spinner?.classList.contains('text-blue-600')).toBe(true);
});

test('shows green dot for completed tools', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'result' as const,
    args: {
      command: 'create',
      path: 'test.tsx'
    },
    result: 'File created successfully'
  };

  render(<ToolCallIndicator tool={tool} />);
  
  const indicator = document.querySelector('.bg-emerald-500');
  expect(indicator).toBeDefined();
  expect(indicator?.classList.contains('w-2')).toBe(true);
  expect(indicator?.classList.contains('h-2')).toBe(true);
  expect(indicator?.classList.contains('rounded-full')).toBe(true);
});

test('handles missing args gracefully', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'call' as const
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Modifying file')).toBeDefined();
});

test('handles missing path gracefully', () => {
  const tool = {
    toolName: 'str_replace_editor',
    state: 'call' as const,
    args: {
      command: 'create'
    }
  };

  render(<ToolCallIndicator tool={tool} />);
  expect(screen.getByText('Creating file')).toBeDefined();
});