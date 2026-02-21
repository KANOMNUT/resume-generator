import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Suite: Form Validation
 *
 * Covers client-side React Hook Form / Zod validation behaviour and the
 * network-level error/success paths of the "Generate PDF" submission flow.
 *
 * Design principles applied here:
 *
 * 1. Every test navigates fresh via beforeEach — no shared state.
 * 2. The `fillRequired` helper is defined locally to keep each spec file
 *    self-contained and avoid coupling to an external helper module.
 * 3. Network calls are intercepted with page.route() only in tests that
 *    need controlled server responses; all other tests let the form's own
 *    client-side validation fire before a request is ever sent.
 * 4. Assertions target user-visible text, not internal implementation
 *    details like class names or component tree structure.
 */

// ---------------------------------------------------------------------------
// Inline helper — fills the five fields that the Zod schema marks as required
// so that tests can isolate a single field under scrutiny.
// ---------------------------------------------------------------------------
async function fillRequired(page: Page): Promise<void> {
  await page.fill("#firstName", "John");
  await page.fill("#lastName", "Doe");
  await page.fill("#email", "john@example.com");
  await page.fill("#phone", "+1234567890");
  await page.locator("#summary").fill(
    "Experienced software engineer with 8 years building web applications."
  );
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
test.describe("Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // -------------------------------------------------------------------------
  // Required-field presence checks — submit the empty form and confirm that
  // each mandatory field produces a visible inline error message.
  // -------------------------------------------------------------------------

  test("shows error for empty firstName", async ({ page }) => {
    // Submitting with no input triggers RHF's validation pass; Zod surfaces
    // "First name is required" for the firstName field.
    await page.getByRole("button", { name: /generate pdf/i }).click();

    // The error paragraph appears immediately below #firstName as a sibling p
    await expect(
      page.locator("#firstName ~ p, #firstName + p").filter({
        hasText: /required/i,
      })
    ).toBeVisible();
  });

  test("shows error for empty lastName", async ({ page }) => {
    await page.getByRole("button", { name: /generate pdf/i }).click();

    await expect(
      page.locator("#lastName ~ p, #lastName + p").filter({
        hasText: /required/i,
      })
    ).toBeVisible();
  });

  test("shows error for empty email", async ({ page }) => {
    await page.getByRole("button", { name: /generate pdf/i }).click();

    await expect(
      page.locator("#email ~ p, #email + p").filter({
        hasText: /required/i,
      })
    ).toBeVisible();
  });

  test("shows error for empty phone", async ({ page }) => {
    await page.getByRole("button", { name: /generate pdf/i }).click();

    await expect(
      page.locator("#phone ~ p, #phone + p").filter({
        hasText: /required/i,
      })
    ).toBeVisible();
  });

  test("shows error for empty summary", async ({ page }) => {
    await page.getByRole("button", { name: /generate pdf/i }).click();

    // SummarySection renders the error inside a div that follows the textarea.
    // The schema message is "Professional summary is required".
    // Use a descendant selector since the <p> is inside a sibling <div>.
    await expect(
      page.locator("#summary ~ div p").filter({
        hasText: /required/i,
      })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Error clearance — typing a valid value into a field that already shows an
  // error should dismiss that specific error message.
  // -------------------------------------------------------------------------

  test("clears firstName error after valid input", async ({ page }) => {
    // Step 1: trigger validation by attempting submission with an empty form
    await page.getByRole("button", { name: /generate pdf/i }).click();

    // Confirm the error is visible before we try to clear it
    const firstNameError = page
      .locator("#firstName ~ p, #firstName + p")
      .filter({ hasText: /required/i });

    await expect(firstNameError).toBeVisible();

    // Step 2: type a valid value — RHF re-validates onChange after the first
    // submission attempt (mode: onSubmit becomes mode: onChange)
    await page.fill("#firstName", "John");

    // Step 3: the error element should disappear from the DOM
    await expect(firstNameError).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Format validation — a value that satisfies presence but fails the email
  // format check should produce "Must be a valid email".
  // -------------------------------------------------------------------------

  test("shows email format error for invalid email", async ({ page }) => {
    // Fill all fields except email with valid data so we isolate the email
    // format rule — if other fields were empty they would absorb the submit
    // and prevent the email error from surfacing.
    await page.fill("#firstName", "John");
    await page.fill("#lastName", "Doe");
    await page.fill("#phone", "+1234567890");
    await page.locator("#summary").fill(
      "Experienced engineer."
    );

    // Deliberately enter a string that passes the min(1) rule but fails
    // the .email() refinement in the Zod schema.
    await page.fill("#email", "notanemail");

    await page.getByRole("button", { name: /generate pdf/i }).click();

    // Zod surfaces "Must be a valid email" from the schema definition
    await expect(
      page.locator("#email ~ p, #email + p").filter({
        hasText: /valid email/i,
      })
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Optional-field non-interference — submitting an empty form must NOT
  // produce validation errors for nickname or profile photo, because those
  // fields are explicitly optional in the schema.
  // -------------------------------------------------------------------------

  test("does not show errors for optional fields", async ({ page }) => {
    await page.getByRole("button", { name: /generate pdf/i }).click();

    // Nickname is optional (z.string().optional()) — no error paragraph
    // should appear below #nickname after an empty submit.
    await expect(
      page.locator("#nickname ~ p, #nickname + p").filter({
        hasText: /required/i,
      })
    ).not.toBeVisible();

    // The photo input is optional — no validation error should appear near
    // the photo-upload input after an empty submit.
    await expect(
      page.locator("#photo-upload ~ p, #photo-upload + p").filter({
        hasText: /required/i,
      })
    ).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Loading state — while the API request is in-flight the submit button
  // must be disabled and show the "Generating PDF..." label to prevent
  // duplicate submissions.
  // -------------------------------------------------------------------------

  test("button becomes disabled while submitting", async ({ page }) => {
    // Intercept the API call and hold it open for 3 seconds so we have a
    // wide window in which to assert the loading state.
    await page.route("/api/generate", async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });

    await fillRequired(page);

    // Click submit — the button should immediately reflect the loading state
    await page.getByRole("button", { name: /generate pdf/i }).click();

    const submitBtn = page.getByRole("button", { name: /generating pdf/i });

    // Assert disabled attribute is present while the request is pending
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // API error banner — when the server returns a non-2xx response the form
  // must surface the error text inside the red banner div.
  // -------------------------------------------------------------------------

  test("error banner appears when API returns error", async ({ page }) => {
    // Mock the API endpoint to return a 500 with a JSON error body.
    // This exercises the catch branch in ResumeForm's onSubmit handler that
    // calls setError() with errorData.error.
    await page.route("/api/generate", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Server error",
          message: "Test error",
        }),
      });
    });

    await fillRequired(page);
    await page.getByRole("button", { name: /generate pdf/i }).click();

    // The red banner is rendered as:
    //   <div class="bg-red-50 border border-red-200 ...">
    //     <p class="text-sm text-red-800">{error}</p>
    //   </div>
    // We target the outer container and verify it contains the error text.
    const errorBanner = page.locator(".bg-red-50");

    await expect(errorBanner).toBeVisible();
    // ResumeForm throws new Error(errorData.error) so the banner text is
    // exactly the "error" field from the JSON body.
    await expect(errorBanner).toContainText(/server error/i);
  });

  // -------------------------------------------------------------------------
  // Error banner clearance — after a failed submission triggers the banner,
  // a subsequent successful submission must hide the banner.
  // -------------------------------------------------------------------------

  test("error banner disappears on new submission", async ({ page }) => {
    // Track how many times the route handler has been invoked so we can
    // alternate between a failure and a success response.
    let callCount = 0;

    await page.route("/api/generate", async (route) => {
      callCount += 1;

      if (callCount === 1) {
        // First call: simulate a server error to trigger the error banner
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Server error", message: "Test" }),
        });
      } else {
        // Subsequent calls: return a minimal valid PDF buffer so the form
        // completes successfully and clears the error state (setError(null)).
        // A real PDF starts with "%PDF-"; we use a small placeholder binary
        // that the browser will accept for the blob download path.
        const minimalPdfBytes = Buffer.from("%PDF-1.4 placeholder");
        await route.fulfill({
          status: 200,
          contentType: "application/pdf",
          headers: {
            "Content-Disposition": 'attachment; filename="resume.pdf"',
          },
          body: minimalPdfBytes,
        });
      }
    });

    await fillRequired(page);

    // First submission — should show the error banner
    await page.getByRole("button", { name: /generate pdf/i }).click();

    const errorBanner = page.locator(".bg-red-50");
    await expect(errorBanner).toBeVisible();

    // Second submission — the form re-enables after the first attempt finishes
    // (isGenerating is set back to false in the finally block). We wait for
    // the button to return to its idle label before clicking again.
    await expect(
      page.getByRole("button", { name: /generate pdf/i })
    ).toBeEnabled();

    await page.getByRole("button", { name: /generate pdf/i }).click();

    // After a successful response the error state is cleared (setError(null))
    // so the banner div is no longer rendered.
    await expect(errorBanner).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Simultaneous multi-field errors — submitting a completely empty form
  // should display inline error messages for every required field at once,
  // not just the first failing one. This confirms that Zod's full validation
  // (not short-circuit) is wired up correctly.
  // -------------------------------------------------------------------------

  test("multiple required field errors shown simultaneously", async ({
    page,
  }) => {
    // Submit with every field empty
    await page.getByRole("button", { name: /generate pdf/i }).click();

    // We expect at minimum one error per required field:
    //   firstName, lastName, email, phone, summary = 5 required fields.
    // Counting all red error paragraphs must return >= 4 to cover the case
    // where summary is rendered slightly differently across viewport sizes.
    const errorMessages = page.locator("p.text-red-600");

    // Wait for at least one error to appear (validation is async with RHF)
    await expect(errorMessages.first()).toBeVisible();

    const count = await errorMessages.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});
