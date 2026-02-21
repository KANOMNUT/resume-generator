// jest.setup.ts
//
// This file runs after Jest has initialized the test framework but before
// any test files execute (configured via setupFilesAfterFramework in
// jest.config.ts).
//
// @testing-library/jest-dom extends Jest's built-in expect() with
// DOM-specific matchers such as:
//   - toBeInTheDocument()
//   - toHaveTextContent()
//   - toBeVisible()
//   - toBeDisabled()
//   - toHaveValue()
//   - toHaveAttribute()
//
// These matchers produce much clearer failure messages than the
// equivalent generic assertions (e.g., expect(el).not.toBeNull()).
import "@testing-library/jest-dom";
