import { test, expect } from "@playwright/test";

/**
 * Suite: Page Load
 *
 * Verifies that all structural elements of the Resume Generator page are
 * rendered correctly on initial navigation before any user interaction.
 * These tests act as a smoke layer — if they fail, deeper validation and
 * submission tests are not worth running.
 *
 * Each test navigates independently so failures are fully isolated and
 * the suite can be parallelised in the future without shared state issues.
 */
test.describe("Page Load", () => {
  // ------------------------------------------------------------------
  // Core page structure
  // ------------------------------------------------------------------

  test("page renders the heading", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Resume Generator");
  });

  test("page renders the form", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("form")).toBeVisible();
  });

  // ------------------------------------------------------------------
  // Personal Information section
  // ------------------------------------------------------------------

  test("Personal Information section is visible", async ({ page }) => {
    await page.goto("/");

    // The section heading is rendered as an h2 inside PersonalInfoSection
    await expect(
      page.getByRole("heading", { name: "Personal Information" })
    ).toBeVisible();
  });

  test("all required field labels are visible", async ({ page }) => {
    await page.goto("/");

    // These four fields carry a red asterisk in the source and are required
    // by the Zod schema, so they are the minimum set a user must complete.
    await expect(page.getByLabel("First Name", { exact: false })).toBeVisible();
    await expect(page.getByLabel("Last Name", { exact: false })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: false })).toBeVisible();
    await expect(page.getByLabel("Phone", { exact: false })).toBeVisible();
  });

  test("optional field labels are visible", async ({ page }) => {
    await page.goto("/");

    // Nickname has no asterisk; Profile Photo label wraps a file-input trigger.
    // Both are present in PersonalInfoSection regardless of whether they carry
    // a validation requirement.
    await expect(
      page.getByLabel("Nickname", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByText("Profile Photo", { exact: false })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // Section headers — each section is rendered by a dedicated component
  // and has an h2 heading. Confirming visibility ensures the component
  // mounts without runtime errors.
  // ------------------------------------------------------------------

  test("Career Summary section is visible", async ({ page }) => {
    await page.goto("/");

    // SummarySection renders "Professional Summary" as its h2 heading.
    // The textarea label is "Summary *", so we target the section heading.
    await expect(
      page.getByRole("heading", { name: "Professional Summary" })
    ).toBeVisible();
  });

  test("Work Experience section header is visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Work Experience" })
    ).toBeVisible();
  });

  test("Education section header is visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Education" })
    ).toBeVisible();
  });

  test("Languages section header is visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Languages" })
    ).toBeVisible();
  });

  test("Skills section header is visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Skills" })
    ).toBeVisible();
  });

  test("Certificates section header is visible", async ({ page }) => {
    await page.goto("/");

    // CertificatesSection uses the heading text "Certifications" in the DOM.
    await expect(
      page.getByRole("heading", { name: "Certifications" })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // Submit button state
  // ------------------------------------------------------------------

  test("Generate PDF button is visible and enabled", async ({ page }) => {
    await page.goto("/");

    const submitBtn = page.getByRole("button", { name: /generate pdf/i });

    await expect(submitBtn).toBeVisible();
    // The button must not start in a disabled state — isGenerating begins false
    await expect(submitBtn).toBeEnabled();
  });

  // ------------------------------------------------------------------
  // Error banner — must be absent on clean load
  // ------------------------------------------------------------------

  test("no error banner on initial load", async ({ page }) => {
    await page.goto("/");

    // The error banner is a div with bg-red-50 containing a <p> with
    // text-red-800. We assert it does not exist in the DOM yet.
    // Using `not.toBeVisible()` rather than `not.toBeAttached()` because
    // React conditionally renders it — it will not be present at all.
    await expect(page.locator(".bg-red-50")).not.toBeVisible();
  });

  // ------------------------------------------------------------------
  // Page metadata
  // ------------------------------------------------------------------

  test("page title is set", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();

    // The layout.tsx metadata sets title: "Resume Generator"
    expect(title.length).toBeGreaterThan(0);
    expect(title).toBeTruthy();
  });
});
