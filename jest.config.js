module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/*.test.js'
  ]
};
