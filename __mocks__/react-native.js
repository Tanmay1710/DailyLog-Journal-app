/**
 * Manual mock for react-native in Jest tests
 * Provides minimal stubs needed for nativewind/babel transformed files
 */

module.exports = {
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    hairlineWidth: () => 0.5,
    absoluteFill: {},
    absoluteFillObject: {},
  },
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  ActivityIndicator: 'ActivityIndicator',
  Switch: 'Switch',
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
    addEventListener: () => ({ remove: jest.fn() }),
  },
  PixelRatio: {
    get: () => 2,
    getFontScale: () => 1,
  },
  StatusBar: {
    currentHeight: 44,
  },
  YellowBox: false,
  LogBox: {
    ignoreLogs: () => {},
    ignoreAllLogs: () => {},
  },
  Appearance: {
    getColorScheme: () => 'light',
    addChangeListener: () => ({ remove: jest.fn() }),
  },
  I18nManager: {
    isRTL: false,
    allowRTL: () => {},
    forceRTL: () => {},
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    ScrollView: 'Animated.ScrollView',
    FlatList: 'Animated.FlatList',
    timing: () => ({ start: jest.fn() }),
    spring: () => ({ start: jest.fn() }),
    Value: jest.fn(),
    createAnimatedComponent: (component) => component,
  },
  NativeModules: {},
  requireNativeComponent: () => 'View',
};
