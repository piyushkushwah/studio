
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

// Attach to global window for jsdom
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID for Node environment
if (!global.crypto) {
  (global as any).crypto = {};
}
if (!global.crypto.randomUUID) {
  (global as any).crypto.randomUUID = () => 'test-uuid-' + Math.random().toString(36).substring(2, 11);
}

// Ensure window also has it for browser-like testing
Object.defineProperty(window, 'crypto', {
  value: global.crypto,
  writable: true
});
