/**
 * Suite: Form Submission and PDF Download
 *
 * Verifies that the resume form produces a downloadable PDF for a range of
 * input combinations — from the bare minimum required fields through fully
 * populated sections. Each test is independent; all navigation is handled
 * inside the individual test or a beforeEach hook so no state leaks between
 * runs.
 *
 * Important timing note: `page.waitForEvent("download")` MUST be set up
 * BEFORE clicking the submit button. The download event fires when the
 * browser intercepts the anchor click triggered by the blob URL handler in
 * ResumeForm.tsx, and the promise must already be pending at that moment to
 * avoid a race condition.
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Inline helper — intentionally not extracted to a shared module so that this
// spec file is fully self-contained and readable in isolation.
// ---------------------------------------------------------------------------

/**
 * Populate only the fields that are schema-required for a successful PDF
 * generation: firstName, lastName, email, phone, and summary.
 *
 * Uses Jane Smith as a clearly-synthetic test persona that is distinct from
 * the John Doe persona used in fill-form.ts, making filename assertions
 * unambiguous even if both helpers are referenced in a combined test run.
 */
async function fillMinimalRequired(page: Page) {
  await page.fill("#firstName", "Jane");
  await page.fill("#lastName", "Smith");
  await page.fill("#email", "jane.smith@example.com");
  await page.fill("#phone", "+9876543210");
  await page.locator("#summary").fill("Dedicated full-stack developer with 5 years experience.");
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

test.describe("Form Submission and PDF Download", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // -------------------------------------------------------------------------
  // Test 1: Minimal required fields produce a named PDF download
  // -------------------------------------------------------------------------

  test("minimal required fields → PDF download", async ({ page }) => {
    await fillMinimalRequired(page);

    // Register the download listener BEFORE the click to prevent a race.
    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    const download = await downloadPromise;

    // The filename is assembled client-side as `${firstName}_${lastName}_Resume.pdf`.
    expect(download.suggestedFilename()).toBe("Jane_Smith_Resume.pdf");

    // The download originates from a blob URL created by window.URL.createObjectURL.
    // Playwright exposes the original page URL for blob-based downloads via url().
    const downloadUrl = download.url();
    expect(downloadUrl).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Test 2: Filename reflects the exact names entered in the form
  // -------------------------------------------------------------------------

  test("download has correct filename from form data", async ({ page }) => {
    await page.fill("#firstName", "Alice");
    await page.fill("#lastName", "Wong");
    await page.fill("#email", "alice.wong@example.com");
    await page.fill("#phone", "+1122334455");
    await page.locator("#summary").fill("Senior product manager with a decade of experience.");

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Alice_Wong_Resume.pdf");
  });

  // -------------------------------------------------------------------------
  // Test 3: Button is disabled and shows spinner text while the API is slow
  // -------------------------------------------------------------------------

  test("button is disabled and shows spinner text during generation", async ({
    page,
  }) => {
    // Intercept /api/generate and add an artificial 2-second delay so that the
    // in-progress state is visible long enough to assert against.
    await page.route("/api/generate", async (route) => {
      await new Promise((res) => setTimeout(res, 2000));
      await route.continue();
    });

    await fillMinimalRequired(page);

    const submitBtn = page.getByRole("button", { name: /generate pdf/i });

    // Start listening for the download BEFORE clicking to avoid a race.
    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await submitBtn.click();

    // Immediately after the click the form is awaiting the mocked API response.
    // React sets isGenerating=true which disables the button and swaps its text.
    await expect(
      page.getByRole("button", { name: /generating pdf\.\.\./i })
    ).toBeDisabled();

    // Wait for the PDF to arrive and the download to complete.
    await downloadPromise;

    // After the response resolves, isGenerating resets to false: button re-enabled.
    await expect(
      page.getByRole("button", { name: /generate pdf/i })
    ).toBeEnabled();
  });

  // -------------------------------------------------------------------------
  // Test 4: Full form (all optional sections populated) → PDF download
  // -------------------------------------------------------------------------

  test("full form submission with all sections → PDF download", async ({
    page,
  }) => {
    // Personal info
    await page.fill("#firstName", "Full");
    await page.fill("#lastName", "Form");
    await page.fill("#email", "full@form.com");
    await page.fill("#phone", "+1111111111");
    await page.locator("#summary").fill("Full-stack engineer with diverse experience.");

    // Skills section — add one skill
    await page.getByRole("button", { name: /add skill/i }).click();
    const skillInputs = page.locator('[name^="skills."][name$=".value"]');
    await skillInputs.nth(0).fill("TypeScript");

    // Certificates section — add one certificate
    await page.getByRole("button", { name: /add certificate/i }).click();
    await page
      .locator('[id^="certificates"][id$="name"]')
      .nth(0)
      .fill("AWS Certified");
    await page
      .locator('[id^="certificates"][id$="issuer"]')
      .nth(0)
      .fill("Amazon");
    await page
      .locator('[id^="certificates"][id$="year"]')
      .nth(0)
      .fill("2023");

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Full_Form_Resume.pdf");
  });

  // -------------------------------------------------------------------------
  // Test 5: Form with a standard link type → PDF download
  // -------------------------------------------------------------------------

  test("form submission with a link → PDF download", async ({ page }) => {
    // Add a single "git" type link
    await page.getByRole("button", { name: /add link/i }).click();

    // The newly-added row defaults to type "git"
    await page
      .locator('select[name^="links."][name$=".type"]')
      .nth(0)
      .selectOption("git");
    await page
      .locator('input[name^="links."][name$=".url"]')
      .nth(0)
      .fill("https://github.com/user/repo");

    await fillMinimalRequired(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    await downloadPromise;
    // Download occurred — no assertion on filename here beyond it completing.
  });

  // -------------------------------------------------------------------------
  // Test 6: "Other" link type with a custom label → PDF download
  // -------------------------------------------------------------------------

  test('form submission with "other" link type + custom label → PDF download', async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add link/i }).click();

    // Change type to "other" — this should reveal the otherLabel input
    await page
      .locator('select[name^="links."][name$=".type"]')
      .nth(0)
      .selectOption("other");

    // Fill the custom label that appears when type === "other"
    await page
      .locator('input[name^="links."][name$=".otherLabel"]')
      .nth(0)
      .fill("Blog");

    await page
      .locator('input[name^="links."][name$=".url"]')
      .nth(0)
      .fill("https://myblog.example.com");

    await fillMinimalRequired(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    await downloadPromise;
  });

  // -------------------------------------------------------------------------
  // Test 7: Form with a work experience entry → PDF download
  // -------------------------------------------------------------------------

  test("form submission with experience entry → PDF download", async ({
    page,
  }) => {
    // Add one work experience entry
    await page.getByRole("button", { name: /add experience/i }).click();
    await page.waitForSelector('[id^="experience"][id$="company"]');

    await page
      .locator('[id^="experience"][id$="company"]')
      .nth(0)
      .fill("Tech Corp");
    await page
      .locator('[id^="experience"][id$="position"]')
      .nth(0)
      .fill("Software Engineer");
    await page
      .locator('select[name^="experience."][name$=".startMonth"]')
      .nth(0)
      .selectOption("Jan");
    await page
      .locator('select[name^="experience."][name$=".startYear"]')
      .nth(0)
      .selectOption("2022");

    // Check "Currently work here" so end date is not required
    await page.locator('[id^="experience"][id$="isCurrent"]').nth(0).check();

    // Description is required by the schema
    await page
      .locator('[id^="experience"][id$="description"]')
      .nth(0)
      .fill("Developed and maintained full-stack web applications.");

    await fillMinimalRequired(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    await downloadPromise;
  });

  // -------------------------------------------------------------------------
  // Test 8: Form with an education entry → PDF download
  // -------------------------------------------------------------------------

  test("form submission with education entry → PDF download", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add education/i }).click();
    await page.waitForSelector('[id^="education"][id$="institution"]');

    await page
      .locator('[id^="education"][id$="institution"]')
      .nth(0)
      .fill("State University");
    await page
      .locator('[id^="education"][id$="degree"]')
      .nth(0)
      .fill("Bachelor of Science");
    await page.locator('select[name^="education."][name$=".startYear"]').nth(0).selectOption("2016");
    await page.locator('[id^="education"][id$="isCurrent"]').nth(0).check();

    await fillMinimalRequired(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    await downloadPromise;
  });

  // -------------------------------------------------------------------------
  // Test 9: Form with a language entry → PDF download
  // -------------------------------------------------------------------------

  test("form submission with languages → PDF download", async ({ page }) => {
    await page.getByRole("button", { name: /add language/i }).click();
    await page.waitForSelector('[id^="languages"][id$="language"]');

    await page
      .locator('[id^="languages"][id$="language"]')
      .nth(0)
      .fill("English");

    // The level select is identified by the same field-array id pattern.
    // The LanguagesSection uses id="languages.${index}.level" (dot-separated).
    await page
      .locator('select[id^="languages"][id$="level"]')
      .nth(0)
      .selectOption("native");

    await fillMinimalRequired(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    await downloadPromise;
  });

  // -------------------------------------------------------------------------
  // Test 10: Form state resets between submissions — second download works
  // -------------------------------------------------------------------------

  test("no data persistence — form can be submitted twice", async ({
    page,
  }) => {
    // First submission with Jane Smith
    await fillMinimalRequired(page);

    const firstDownloadPromise = page.waitForEvent("download", {
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    const firstDownload = await firstDownloadPromise;

    expect(firstDownload.suggestedFilename()).toBe("Jane_Smith_Resume.pdf");

    // Wait for the button to return to its idle state before the second fill.
    await expect(
      page.getByRole("button", { name: /generate pdf/i })
    ).toBeEnabled();

    // Overwrite firstName — the rest of the required fields remain filled.
    await page.fill("#firstName", "Second");

    const secondDownloadPromise = page.waitForEvent("download", {
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /generate pdf/i }).click();
    const secondDownload = await secondDownloadPromise;

    // Only the first-name segment changes; the filename must start with "Second_".
    expect(secondDownload.suggestedFilename()).toMatch(/^Second_/);
  });
});
