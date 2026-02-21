const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  verbose: true,

  // Default environment for lib/api/backend tests.
  // Component tests override this with the @jest-environment jsdom docblock.
  testEnvironment: "node",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // Replace pdfkit with a manual mock so tests never touch native bindings.
    "^pdfkit$": "<rootDir>/__mocks__/pdfkit.ts",
  },

  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],

  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!app/layout.tsx",
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// createJestConfig merges next/jest's SWC transforms and module stubs on top.
module.exports = createJestConfig(config);
