/**
 * Manual mock for nativewind in Jest tests
 * Provides minimal stubs for transformed component tests
 */

const mockStyled = (component) => component;

module.exports = {
  styled: mockStyled,
  NativeWindStyleSheet: {
    create: () => {},
    get: () => '',
    setOutput: () => {},
  },
  StyleSheet: {
    create: (styles) => styles,
  },
};
