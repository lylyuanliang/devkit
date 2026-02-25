import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock CSS modules globally
vi.mock('*.css', () => ({}), { virtual: true });
vi.mock('*.scss', () => ({}), { virtual: true });

// Mock Tailwind
vi.mock('tailwindcss', () => ({}));
