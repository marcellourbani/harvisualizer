import '@testing-library/jest-dom';

// Mock crypto.randomUUID() for jsdom environment
if (typeof crypto === 'undefined') {
  global.crypto = {} as any;
}
if (!crypto.randomUUID) {
  crypto.randomUUID = () => Math.random().toString(36).substring(2, 15);
}