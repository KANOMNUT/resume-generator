/**
 * Unit tests for POST /api/generate (app/api/generate/route.ts)
 *
 * Strategy
 * --------
 * The route handler composes three external dependencies:
 *   - resumeSchema.safeParse  — Zod validation
 *   - sanitizeResumeData      — data sanitization
 *   - generateResumePDF       — PDF buffer generation
 *
 * All three are fully mocked so tests remain deterministic, fast, and
 * isolated from native C++ bindings (pdfkit), filesystem I/O, and
 * schema internals. Each test exercises a single code path through
 * the handler and asserts on the observable contract: HTTP status,
 * response body, response headers, and mock call arguments.
 *
 * Test environment: node (configured in jest.config.ts — no DOM APIs).
 */

// ---------------------------------------------------------------------------
// 1. Module-level mocks — must be hoisted before any import statements.
//    jest.mock() calls are hoisted to the top of the compiled output by
//    Babel/SWC, but the factory functions run at module evaluation time,
//    so the mocked modules are in place before the route is imported.
// ---------------------------------------------------------------------------

jest.mock("@/lib/schema", () => ({
  resumeSchema: { safeParse: jest.fn() },
}));

jest.mock("@/lib/sanitize", () => ({
  sanitizeResumeData: jest.fn((data) => data),
}));

jest.mock("@/lib/pdf-generator", () => ({
  generateResumePDF: jest.fn(),
}));

// ---------------------------------------------------------------------------
// 2. Imports — after mocks are declared so Jest intercepts the modules.
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { resumeSchema } from "@/lib/schema";
import { sanitizeResumeData } from "@/lib/sanitize";
import { generateResumePDF } from "@/lib/pdf-generator";
import { POST } from "@/app/api/generate/route";

// ---------------------------------------------------------------------------
// 3. Typed mock handles — avoids repetitive `as jest.Mock` casts in tests.
// ---------------------------------------------------------------------------

const mockSafeParse = resumeSchema.safeParse as jest.Mock;
const mockSanitize = sanitizeResumeData as jest.Mock;
const mockGeneratePDF = generateResumePDF as jest.Mock;

// ---------------------------------------------------------------------------
// 4. Shared test fixture
//
//    VALID_BODY satisfies the resumeSchema shape so that, when mockSafeParse
//    returns { success: true, data: VALID_BODY }, the handler proceeds through
//    sanitization and PDF generation without hitting any validation branch.
// ---------------------------------------------------------------------------

const VALID_BODY = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+1234567890",
  summary: "A professional summary",
  links: [],
  experience: [],
  education: [],
  languages: [],
  skills: [],
  certificates: [],
};

// ---------------------------------------------------------------------------
// 5. Factory helpers
// ---------------------------------------------------------------------------

/**
 * Builds a NextRequest with a JSON body and optional extra headers.
 * The Content-Type header defaults to application/json so the handler's
 * request.json() call succeeds on the happy path.
 */
function makeRequest(
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

/**
 * Configures all three mocks for the full success path so individual tests
 * only need to override the specific mock relevant to their scenario.
 */
function setupSuccessMocks(): void {
  mockSafeParse.mockReturnValue({ success: true, data: VALID_BODY });
  mockSanitize.mockReturnValue(VALID_BODY);
  mockGeneratePDF.mockResolvedValue(Buffer.from("%PDF-1.4 test content"));
}

// ---------------------------------------------------------------------------
// 6. Test suite
// ---------------------------------------------------------------------------

describe("POST /api/generate", () => {
  // Suppress console.error output so PDF-crash and unexpected-error logs
  // do not clutter the test report. We still assert on returned status codes.
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // TC-001: Oversized payload — content-length guard
  // -------------------------------------------------------------------------
  it("returns 413 when content-length header exceeds 2MB", async () => {
    // Arrange
    // 9 999 999 bytes > MAX_BODY_SIZE (2 097 152). The handler reads the
    // header value before touching the body, so the body itself is irrelevant.
    const request = makeRequest(VALID_BODY, { "content-length": "9999999" });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(413);
    expect(body.error).toBe("Request body too large");
    expect(body.message).toContain("2097152");
  });

  // -------------------------------------------------------------------------
  // TC-002: Malformed JSON body
  // -------------------------------------------------------------------------
  it("returns 400 when the request body is not valid JSON", async () => {
    // Arrange
    // Bypass makeRequest so we can supply a raw non-JSON string body.
    // nextjs NextRequest.json() will reject when it cannot parse the payload.
    const request = new NextRequest("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{{{",
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid JSON");
    // The message is derived from the caught SyntaxError — just verify it exists.
    expect(typeof body.message).toBe("string");
    expect(body.message.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // TC-003: Schema validation failure with field-level errors
  // -------------------------------------------------------------------------
  it("returns 400 with fieldErrors when schema validation fails", async () => {
    // Arrange
    // safeParse returns a Zod-like failure object. The handler calls
    // error.flatten() and includes the result in the response body.
    mockSafeParse.mockReturnValue({
      success: false,
      error: {
        flatten: () => ({
          fieldErrors: { firstName: ["First name is required"] },
          formErrors: [],
        }),
      },
    });

    // Act
    const response = await POST(makeRequest({}));
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.message).toBe(
      "The provided resume data contains validation errors"
    );
    // Field-level errors must be forwarded to the caller verbatim.
    expect(body.fieldErrors).toEqual({
      firstName: ["First name is required"],
    });
    expect(body.formErrors).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // TC-004: Missing required fields triggers 400
  // -------------------------------------------------------------------------
  it("returns 400 when required fields are absent from the request body", async () => {
    // Arrange
    // Simulate safeParse rejecting a completely empty object.
    mockSafeParse.mockReturnValue({
      success: false,
      error: {
        flatten: () => ({
          fieldErrors: {
            firstName: ["First name is required"],
            lastName: ["Last name is required"],
            email: ["Email is required"],
            phone: ["Phone number is required"],
            summary: ["Professional summary is required"],
          },
          formErrors: [],
        }),
      },
    });

    // Act
    const response = await POST(makeRequest({}));
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    // All missing fields must appear in the error map.
    expect(body.fieldErrors).toHaveProperty("firstName");
    expect(body.fieldErrors).toHaveProperty("lastName");
    expect(body.fieldErrors).toHaveProperty("email");
    expect(body.fieldErrors).toHaveProperty("phone");
    expect(body.fieldErrors).toHaveProperty("summary");
  });

  // -------------------------------------------------------------------------
  // TC-005: Happy path — PDF returned with correct headers
  // -------------------------------------------------------------------------
  it("returns 200 with a PDF response and all required headers on a valid request", async () => {
    // Arrange
    setupSuccessMocks();

    // Act
    const response = await POST(makeRequest(VALID_BODY));

    // Assert — status
    expect(response.status).toBe(200);

    // Assert — Content-Type must be application/pdf (not JSON)
    expect(response.headers.get("Content-Type")).toBe("application/pdf");

    // Assert — disposition must reference the expected filename
    const disposition = response.headers.get("Content-Disposition") ?? "";
    expect(disposition).toContain("resume.pdf");
    expect(disposition).toContain("attachment");

    // Assert — security headers
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    const cacheControl = response.headers.get("Cache-Control") ?? "";
    expect(cacheControl).toContain("no-store");

    // Assert — pipeline invocations
    expect(mockGeneratePDF).toHaveBeenCalledTimes(1);
    expect(mockSanitize).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // TC-006: PDF generator throws — 500 returned
  // -------------------------------------------------------------------------
  it("returns 500 when generateResumePDF throws an error", async () => {
    // Arrange
    mockSafeParse.mockReturnValue({ success: true, data: VALID_BODY });
    mockSanitize.mockReturnValue(VALID_BODY);
    // Simulate an internal crash inside the PDF library.
    mockGeneratePDF.mockRejectedValue(new Error("PDF crash"));

    // Act
    const response = await POST(makeRequest(VALID_BODY));
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body.error).toBe("PDF generation failed");
    expect(body.message).toBe(
      "An error occurred while generating the PDF resume"
    );
  });

  // -------------------------------------------------------------------------
  // TC-007: sanitizeResumeData is called with the exact data returned by
  //         safeParse, not the raw request body
  // -------------------------------------------------------------------------
  it("calls sanitizeResumeData with the validated data from safeParse", async () => {
    // Arrange
    // Return a distinct object reference so we can verify the exact argument.
    const validatedData = { ...VALID_BODY, firstName: "ValidatedJohn" };
    mockSafeParse.mockReturnValue({ success: true, data: validatedData });
    mockSanitize.mockReturnValue(validatedData);
    mockGeneratePDF.mockResolvedValue(Buffer.from("%PDF-1.4 minimal"));

    // Act
    await POST(makeRequest(VALID_BODY));

    // Assert — sanitize must receive what safeParse produced, not the raw body.
    expect(mockSanitize).toHaveBeenCalledTimes(1);
    expect(mockSanitize).toHaveBeenCalledWith(validatedData);
  });

  // -------------------------------------------------------------------------
  // TC-008: Absent content-length header does not trigger 413
  // -------------------------------------------------------------------------
  it("does not return 413 when the content-length header is absent", async () => {
    // Arrange
    // makeRequest omits content-length by default, so the size guard must be
    // skipped and the success path must complete.
    setupSuccessMocks();

    // Act — explicitly omit the content-length header
    const response = await POST(makeRequest(VALID_BODY));

    // Assert — must not be rejected as too large
    expect(response.status).not.toBe(413);
    expect(response.status).toBe(200);
  });

  // -------------------------------------------------------------------------
  // TC-009: Response body is a non-empty PDF buffer
  // -------------------------------------------------------------------------
  it("returns a non-empty ArrayBuffer body for a valid PDF response", async () => {
    // Arrange
    const pdfContent = "%PDF-1.4 test content for buffer length check";
    setupSuccessMocks();
    mockGeneratePDF.mockResolvedValue(Buffer.from(pdfContent));

    // Act
    const response = await POST(makeRequest(VALID_BODY));

    // Assert — response body must carry actual bytes, not an empty payload.
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    // The Content-Length header must match the actual buffer size returned by
    // generateResumePDF so HTTP clients can detect truncated transfers.
    const contentLength = response.headers.get("Content-Length");
    expect(contentLength).toBe(
      Buffer.from(pdfContent).length.toString()
    );
  });

  // -------------------------------------------------------------------------
  // TC-010: Successive calls are fully independent — no shared state
  // -------------------------------------------------------------------------
  it("processes two sequential POST calls independently with no shared state", async () => {
    // Arrange — first call succeeds, second call encounters a PDF failure.
    mockSafeParse.mockReturnValue({ success: true, data: VALID_BODY });
    mockSanitize.mockReturnValue(VALID_BODY);

    // First call: PDF generation succeeds.
    mockGeneratePDF.mockResolvedValueOnce(Buffer.from("%PDF-1.4 first"));
    // Second call: PDF generation throws.
    mockGeneratePDF.mockRejectedValueOnce(new Error("second call crash"));

    // Act
    const firstResponse = await POST(makeRequest(VALID_BODY));
    const secondResponse = await POST(makeRequest(VALID_BODY));

    // Assert — each call must reflect its own mock behavior independently.
    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(500);

    const secondBody = await secondResponse.json();
    expect(secondBody.error).toBe("PDF generation failed");
  });

  // -------------------------------------------------------------------------
  // Additional edge cases
  // -------------------------------------------------------------------------

  // TC-011: content-length exactly at the limit is not rejected
  it("does not return 413 when content-length equals MAX_BODY_SIZE exactly", async () => {
    // Arrange — 2 097 152 == MAX_BODY_SIZE; the guard uses strict greater-than.
    setupSuccessMocks();
    const request = makeRequest(VALID_BODY, { "content-length": "2097152" });

    // Act
    const response = await POST(request);

    // Assert — exactly at the limit must be allowed through.
    expect(response.status).toBe(200);
  });

  // TC-012: content-length one byte over the limit is rejected
  it("returns 413 when content-length is exactly one byte over MAX_BODY_SIZE", async () => {
    // Arrange — 2 097 153 == MAX_BODY_SIZE + 1 triggers the guard.
    const request = makeRequest(VALID_BODY, { "content-length": "2097153" });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(413);
    expect(body.error).toBe("Request body too large");
  });

  // TC-013: generateResumePDF receives sanitized data, not raw validated data
  it("calls generateResumePDF with the output of sanitizeResumeData", async () => {
    // Arrange — sanitize transforms the validated data into a distinct object.
    const validatedData = { ...VALID_BODY };
    const sanitizedData = { ...VALID_BODY, firstName: "SanitizedJohn" };

    mockSafeParse.mockReturnValue({ success: true, data: validatedData });
    mockSanitize.mockReturnValue(sanitizedData);
    mockGeneratePDF.mockResolvedValue(Buffer.from("%PDF-1.4 sanitized"));

    // Act
    await POST(makeRequest(VALID_BODY));

    // Assert — the PDF generator must operate on the sanitized output.
    expect(mockGeneratePDF).toHaveBeenCalledTimes(1);
    expect(mockGeneratePDF).toHaveBeenCalledWith(sanitizedData);
  });

  // TC-014: safeParse is called with the parsed request body
  it("calls resumeSchema.safeParse with the parsed JSON body", async () => {
    // Arrange
    setupSuccessMocks();
    const requestBody = { ...VALID_BODY, firstName: "ParseTest" };
    mockSafeParse.mockReturnValue({ success: true, data: requestBody });
    mockSanitize.mockReturnValue(requestBody);

    // Act
    await POST(makeRequest(requestBody));

    // Assert — safeParse must receive the deserialized body object.
    expect(mockSafeParse).toHaveBeenCalledTimes(1);
    expect(mockSafeParse).toHaveBeenCalledWith(requestBody);
  });

  // TC-015: Validation failure does not invoke sanitize or PDF generation
  it("does not call sanitizeResumeData or generateResumePDF when validation fails", async () => {
    // Arrange
    mockSafeParse.mockReturnValue({
      success: false,
      error: {
        flatten: () => ({ fieldErrors: {}, formErrors: ["Invalid data"] }),
      },
    });

    // Act
    await POST(makeRequest({}));

    // Assert — downstream pipeline steps must be skipped entirely.
    expect(mockSanitize).not.toHaveBeenCalled();
    expect(mockGeneratePDF).not.toHaveBeenCalled();
  });

  // TC-016: 413 response body contains max size in the message
  it("includes the exact MAX_BODY_SIZE value in the 413 message", async () => {
    // Arrange
    const request = makeRequest(VALID_BODY, { "content-length": "9999999" });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert — callers must be told the exact byte limit so they can adjust.
    expect(body.message).toBe("Maximum allowed size is 2097152 bytes");
  });

  // TC-017: Invalid JSON path does not invoke safeParse, sanitize, or PDF generation
  it("does not call safeParse, sanitizeResumeData, or generateResumePDF when JSON is invalid", async () => {
    // Arrange
    const request = new NextRequest("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{{invalid",
    });

    // Act
    await POST(request);

    // Assert — the handler must short-circuit before reaching any of these.
    expect(mockSafeParse).not.toHaveBeenCalled();
    expect(mockSanitize).not.toHaveBeenCalled();
    expect(mockGeneratePDF).not.toHaveBeenCalled();
  });
});
