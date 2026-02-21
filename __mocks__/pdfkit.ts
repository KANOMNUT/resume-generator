// __mocks__/pdfkit.ts
//
// Manual mock for the `pdfkit` npm package.
//
// Why a manual mock is required here:
//   pdfkit depends on native Node.js C++ bindings (canvas, fontkit) that
//   cannot be compiled or executed inside a Jest worker. Letting Jest try
//   to load the real module causes the test run to crash with a native
//   binding error.
//
// This mock replaces every PDFDocument method with a jest.fn() stub so
// that code under test can:
//   1. Import pdfkit without triggering native code.
//   2. Assert that PDF builder methods were called with the right arguments.
//   3. Simulate chained method calls (font().fontSize().text()) because each
//      chainable method returns `this` via mockReturnThis().
//
// The mapping from the real module to this file is defined in jest.config.ts:
//   moduleNameMapper: { "^pdfkit$": "<rootDir>/__mocks__/pdfkit.ts" }

const PDFDocument = jest.fn().mockImplementation(() => ({
  // Event emitter — used by callers that listen for 'data' and 'end' events
  // to collect the streamed PDF buffer.
  on: jest.fn(),
  end: jest.fn(),
  pipe: jest.fn(),

  // Text styling — all return `this` so chained calls work:
  //   doc.font("Helvetica").fontSize(12).fillColor("#000").text("Hello")
  font: jest.fn().mockReturnThis(),
  fontSize: jest.fn().mockReturnThis(),
  fillColor: jest.fn().mockReturnThis(),
  strokeColor: jest.fn().mockReturnThis(),

  // Content output
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  image: jest.fn().mockReturnThis(),

  // Vector drawing — used for section divider lines
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  stroke: jest.fn().mockReturnThis(),
  lineWidth: jest.fn().mockReturnThis(),

  // Page management
  addPage: jest.fn().mockReturnThis(),

  // Mutable state property read by pdf-generator to track vertical position
  y: 100,
}));

// pdfkit uses CommonJS exports (`module.exports = PDFDocument`) so we must
// use the same export style here. Using `export default` would result in
// callers receiving `{ default: MockFn }` instead of the constructor directly.
module.exports = PDFDocument;
