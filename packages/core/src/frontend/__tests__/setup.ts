import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock CSS imports
jest.mock('*.css', () => ({}));
jest.mock('*.scss', () => ({}));

// Mock Tailwind
jest.mock('tailwindcss', () => ({}));
