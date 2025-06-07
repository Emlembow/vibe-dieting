const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!jest.setup.js',
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 45,
      lines: 50,
      statements: 50
    },
    // Critical business logic requires high coverage
    './app/actions/auth.ts': {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './app/actions/trends.ts': {
      branches: 65,
      functions: 80,
      lines: 85,
      statements: 85
    },
    // Core validation must be 100% covered for security
    './lib/validations.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    // Main pages need good coverage for reliability
    './app/(protected)/dashboard/page.tsx': {
      branches: 55,
      functions: 35,
      lines: 60,
      statements: 60
    },
    // Utility functions must be reliable
    './lib/utils.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  // Resource management for CI/CD
  maxWorkers: process.env.CI ? 2 : '50%',
  testTimeout: 30000,
  workerIdleMemoryLimit: '512MB',
  // Prevent memory leaks in long-running test suites
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)