import '@testing-library/jest-dom';

// Mock crypto.randomUUID() for jsdom environment
if (typeof crypto === 'undefined') {
  global.crypto = {} as any;
}
if (!crypto.randomUUID) {
  crypto.randomUUID = () => Math.random().toString(36).substring(2, 15);
}

// Polyfill for ElementInternals API required by vscode-elements
// JSDOM has a partial implementation, so we need to patch missing methods
class MockElementInternals {
  form: HTMLFormElement | null = null;
  labels: NodeList = { length: 0, item: () => null, [Symbol.iterator]: function* () {} } as any;
  states = new Set();
  validationMessage = '';
  validity: ValidityState = {
    badInput: false,
    customError: false,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valid: true,
    valueMissing: false,
  };
  willValidate = true;

  setFormValue(_value: any, _state?: any) {
    // Mock implementation - does nothing in tests
  }
  setValidity(_flags?: Partial<ValidityState>, _message?: string, _anchor?: HTMLElement) {
    // Mock implementation
  }
  checkValidity() {
    return true;
  }
  reportValidity() {
    return true;
  }
}

// Patch ElementInternals if it exists but is incomplete
if (window.ElementInternals && window.ElementInternals.prototype) {
  if (!window.ElementInternals.prototype.setFormValue) {
    window.ElementInternals.prototype.setFormValue = MockElementInternals.prototype.setFormValue;
  }
  if (!window.ElementInternals.prototype.setValidity) {
    window.ElementInternals.prototype.setValidity = MockElementInternals.prototype.setValidity;
  }
  if (!window.ElementInternals.prototype.checkValidity) {
    window.ElementInternals.prototype.checkValidity = MockElementInternals.prototype.checkValidity;
  }
  if (!window.ElementInternals.prototype.reportValidity) {
    window.ElementInternals.prototype.reportValidity = MockElementInternals.prototype.reportValidity;
  }
} else {
  // If ElementInternals doesn't exist at all, create it
  (window as any).ElementInternals = MockElementInternals;
}

// Ensure attachInternals returns a properly mocked ElementInternals
if (!HTMLElement.prototype.attachInternals) {
  HTMLElement.prototype.attachInternals = function() {
    return new MockElementInternals() as any;
  };
}