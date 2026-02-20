import { NextRequest, NextResponse } from "next/server";
import { resumeSchema } from "@/lib/schema";
import { sanitizeResumeData } from "@/lib/sanitize";
import { generateResumePDF } from "@/lib/pdf-generator";

// Maximum allowed request body size (512KB)
const MAX_BODY_SIZE = 512000;

/**
 * POST /api/generate
 *
 * Generates a PDF resume from validated JSON resume data.
 *
 * Request body: ResumeData conforming to resumeSchema
 *
 * Response:
 * - 200: PDF file as application/pdf
 * - 400: Validation error with field-level error details
 * - 413: Request body too large
 * - 500: Internal server error during PDF generation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check content-length header to prevent large payloads
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        {
          error: "Request body too large",
          message: `Maximum allowed size is ${MAX_BODY_SIZE} bytes`,
        },
        { status: 413 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid JSON",
          message:
            error instanceof Error
              ? error.message
              : "Failed to parse request body",
        },
        { status: 400 }
      );
    }

    // Validate against schema
    const validationResult = resumeSchema.safeParse(body);

    if (!validationResult.success) {
      // Flatten Zod errors for clearer field-level error messages
      const fieldErrors = validationResult.error.flatten();

      return NextResponse.json(
        {
          error: "Validation failed",
          message: "The provided resume data contains validation errors",
          fieldErrors: fieldErrors.fieldErrors,
          formErrors: fieldErrors.formErrors,
        },
        { status: 400 }
      );
    }

    // Sanitize the validated data
    const sanitizedData = sanitizeResumeData(validationResult.data);

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateResumePDF(sanitizedData);
    } catch (error) {
      // Log the actual error for debugging (in production, this would go to a logging service)
      console.error("PDF generation failed:", error);

      return NextResponse.json(
        {
          error: "PDF generation failed",
          message: "An error occurred while generating the PDF resume",
        },
        { status: 500 }
      );
    }

    // Return PDF with appropriate headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
        // Security headers
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected error in /api/generate:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
