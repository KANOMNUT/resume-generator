/**
 * Suite: Dynamic Section Interactions
 *
 * Verifies that every section whose content is managed by React Hook Form's
 * useFieldArray behaves correctly for the standard CRUD interactions a user
 * can perform: adding entries, removing entries, and responding to conditional
 * UI changes (e.g., isCurrent disabling end-date selects, type="other"
 * revealing an extra input).
 *
 * These tests deliberately do NOT submit the form. They assert only on DOM
 * state so they run fast and stay completely isolated from the PDF-generation
 * API. Each test starts from a clean page via beforeEach.
 *
 * Implementation notes:
 * - All field IDs use React Hook Form's dot-notation array path, e.g.
 *   "experience.0.company". Playwright attribute selectors treat the dot as a
 *   literal character, so [id^="experience"][id$="company"] matches reliably.
 * - "Remove" buttons are plain text buttons rendered by each section component.
 *   We scope removal assertions to the entry card that was just added to avoid
 *   ambiguity when multiple entries are present.
 */

import { test, expect } from "@playwright/test";

test.describe("Dynamic Section Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ==========================================================================
  // Links section
  // ==========================================================================

  test('"Add Link" button adds a new link row', async ({ page }) => {
    await page.getByRole("button", { name: /add link/i }).click();

    // After clicking, both a type select and a URL input should be visible.
    await expect(
      page.locator('select[name^="links."][name$=".type"]').nth(0)
    ).toBeVisible();
    await expect(
      page.locator('input[name^="links."][name$=".url"]').nth(0)
    ).toBeVisible();
  });

  test("link row can be removed", async ({ page }) => {
    await page.getByRole("button", { name: /add link/i }).click();

    // Confirm the URL input is present before removal.
    await expect(
      page.locator('input[name^="links."][name$=".url"]').nth(0)
    ).toBeVisible();

    // Click the "Remove" button for the first (and only) link row.
    // The Remove button is a sibling of the URL input inside the same flex row.
    await page.getByRole("button", { name: "Remove" }).nth(0).click();

    // The URL input should no longer be attached to the DOM.
    await expect(
      page.locator('input[name^="links."][name$=".url"]')
    ).not.toBeAttached();
  });

  test("adding multiple links shows multiple rows", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add link/i });

    await addBtn.click();
    await addBtn.click();
    await addBtn.click();

    // Three URL inputs should now be in the DOM.
    await expect(
      page.locator('input[name^="links."][name$=".url"]')
    ).toHaveCount(3);
  });

  test('selecting "Other" link type shows otherLabel input', async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add link/i }).click();

    // Change type from the default "git" to "other"
    await page
      .locator('select[name^="links."][name$=".type"]')
      .nth(0)
      .selectOption("other");

    // The otherLabel input is conditionally rendered when type === "other".
    // It has placeholder text "e.g., Blog, Website, Portfolio" in the source.
    await expect(
      page.locator('input[name^="links."][name$=".otherLabel"]').nth(0)
    ).toBeVisible();
  });

  test('selecting non-"Other" type hides otherLabel input', async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add link/i }).click();

    // First switch to "other" so the label input renders…
    await page
      .locator('select[name^="links."][name$=".type"]')
      .nth(0)
      .selectOption("other");

    await expect(
      page.locator('input[name^="links."][name$=".otherLabel"]').nth(0)
    ).toBeVisible();

    // …then switch away. The input is conditionally rendered — it should
    // disappear from the DOM entirely (not just be hidden).
    await page
      .locator('select[name^="links."][name$=".type"]')
      .nth(0)
      .selectOption("git");

    await expect(
      page.locator('input[name^="links."][name$=".otherLabel"]')
    ).not.toBeAttached();
  });

  // ==========================================================================
  // Work Experience section
  // ==========================================================================

  test('"Add Work Experience" button adds entry', async ({ page }) => {
    // The rendered button text is "Add Experience" (ExperienceSection.tsx line 377).
    await page.getByRole("button", { name: /add experience/i }).click();

    // The company input is the first field in the entry card.
    await expect(
      page.locator('[id^="experience"][id$="company"]').nth(0)
    ).toBeVisible();
  });

  test("isCurrent checkbox disables end date fields", async ({ page }) => {
    await page.getByRole("button", { name: /add experience/i }).click();
    await page.waitForSelector('[id^="experience"][id$="isCurrent"]');

    // Check "Currently work here"
    await page.locator('[id^="experience"][id$="isCurrent"]').nth(0).check();

    // Both end-date selects must become disabled.
    await expect(
      page.locator('select[name^="experience."][name$=".endMonth"]').nth(0)
    ).toBeDisabled();
    await expect(
      page.locator('select[name^="experience."][name$=".endYear"]').nth(0)
    ).toBeDisabled();
  });

  test("unchecking isCurrent re-enables end date fields", async ({ page }) => {
    await page.getByRole("button", { name: /add experience/i }).click();
    await page.waitForSelector('[id^="experience"][id$="isCurrent"]');

    const isCurrentCheckbox = page
      .locator('[id^="experience"][id$="isCurrent"]')
      .nth(0);

    // Check then immediately uncheck
    await isCurrentCheckbox.check();
    await isCurrentCheckbox.uncheck();

    // End-date selects must be enabled again.
    await expect(
      page.locator('select[name^="experience."][name$=".endMonth"]').nth(0)
    ).toBeEnabled();
    await expect(
      page.locator('select[name^="experience."][name$=".endYear"]').nth(0)
    ).toBeEnabled();
  });

  test("work experience entry can be removed", async ({ page }) => {
    await page.getByRole("button", { name: /add experience/i }).click();
    await page.waitForSelector('[id^="experience"][id$="company"]');

    // Confirm it rendered
    await expect(
      page.locator('[id^="experience"][id$="company"]').nth(0)
    ).toBeVisible();

    // The experience entry card contains a "Remove" button in its header row.
    // Only one entry exists, so nth(0) is unambiguous.
    await page.getByRole("button", { name: "Remove" }).nth(0).click();

    // The company input is no longer in the DOM.
    await expect(
      page.locator('[id^="experience"][id$="company"]')
    ).not.toBeAttached();
  });

  test("can add a project under experience", async ({ page }) => {
    // Add an experience entry first
    await page.getByRole("button", { name: /add experience/i }).click();
    await page.waitForSelector('[id^="experience"][id$="company"]');

    // Fill the required fields so the entry is valid (not required for this DOM
    // assertion, but good practice to avoid confusing React state).
    await page
      .locator('[id^="experience"][id$="company"]')
      .nth(0)
      .fill("Acme Ltd");
    await page
      .locator('[id^="experience"][id$="position"]')
      .nth(0)
      .fill("Developer");
    await page
      .locator('select[name^="experience."][name$=".startMonth"]')
      .nth(0)
      .selectOption("Mar");
    await page
      .locator('select[name^="experience."][name$=".startYear"]')
      .nth(0)
      .selectOption("2021");

    // Click the "Add Project" button that belongs to the first experience entry.
    await page.getByRole("button", { name: /add project/i }).nth(0).click();

    // A project name input should now be visible. The id follows the pattern:
    // "experience.0.projects.0.name"
    await expect(
      page.locator('[id^="experience"][id$="name"]').nth(0)
    ).toBeVisible();
  });

  // ==========================================================================
  // Education section
  // ==========================================================================

  test('"Add Education" button adds entry', async ({ page }) => {
    await page.getByRole("button", { name: /add education/i }).click();

    await expect(
      page.locator('[id^="education"][id$="institution"]').nth(0)
    ).toBeVisible();
  });

  test("education entry can be removed", async ({ page }) => {
    await page.getByRole("button", { name: /add education/i }).click();
    await page.waitForSelector('[id^="education"][id$="institution"]');

    await page.getByRole("button", { name: "Remove" }).nth(0).click();

    await expect(
      page.locator('[id^="education"][id$="institution"]')
    ).not.toBeAttached();
  });

  // ==========================================================================
  // Languages section
  // ==========================================================================

  test('"Add Language" button adds entry', async ({ page }) => {
    await page.getByRole("button", { name: /add language/i }).click();

    // Both the language text input and the level select must appear.
    await expect(
      page.locator('[id^="languages"][id$="language"]').nth(0)
    ).toBeVisible();
    await expect(
      page.locator('select[id^="languages"][id$="level"]').nth(0)
    ).toBeVisible();
  });

  test("language level dropdown has correct options", async ({ page }) => {
    await page.getByRole("button", { name: /add language/i }).click();
    await page.waitForSelector('select[id^="languages"][id$="level"]');

    const levelSelect = page
      .locator('select[id^="languages"][id$="level"]')
      .nth(0);

    // Verify each expected proficiency value is present as an <option>.
    // We check the option values because display text capitalisation may vary.
    const optionValues = await levelSelect.locator("option").evaluateAll(
      (options) => options.map((o) => (o as HTMLOptionElement).value)
    );

    expect(optionValues).toContain("native");
    expect(optionValues).toContain("fluent");
    expect(optionValues).toContain("advanced");
    expect(optionValues).toContain("intermediate");
    expect(optionValues).toContain("basic");
  });

  test("language entry can be removed", async ({ page }) => {
    await page.getByRole("button", { name: /add language/i }).click();
    await page.waitForSelector('[id^="languages"][id$="language"]');

    await page.getByRole("button", { name: "Remove" }).nth(0).click();

    await expect(
      page.locator('[id^="languages"][id$="language"]')
    ).not.toBeAttached();
  });

  // ==========================================================================
  // Skills section
  // ==========================================================================

  test('"Add Skill" button adds a skill input', async ({ page }) => {
    await page.getByRole("button", { name: /add skill/i }).click();

    await expect(
      page.locator('[name^="skills."][name$=".value"]').nth(0)
    ).toBeVisible();
  });

  test("multiple skills can be added", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add skill/i });

    await addBtn.click();
    await addBtn.click();
    await addBtn.click();

    await expect(page.locator('[name^="skills."][name$=".value"]')).toHaveCount(3);
  });

  test("skill can be removed", async ({ page }) => {
    await page.getByRole("button", { name: /add skill/i }).click();
    await page.waitForSelector('[name^="skills."]');

    // The skill row has a "Remove" button next to the text input.
    await page.getByRole("button", { name: "Remove" }).nth(0).click();

    await expect(
      page.locator('[name^="skills."][name$=".value"]')
    ).not.toBeAttached();
  });

  // ==========================================================================
  // Certificates section
  // ==========================================================================

  test('"Add Certificate" button adds entry', async ({ page }) => {
    await page.getByRole("button", { name: /add certificate/i }).click();

    // All three certificate inputs must appear: name, issuer, and year.
    await expect(
      page.locator('[id^="certificates"][id$="name"]').nth(0)
    ).toBeVisible();
    await expect(
      page.locator('[id^="certificates"][id$="issuer"]').nth(0)
    ).toBeVisible();
    await expect(
      page.locator('[id^="certificates"][id$="year"]').nth(0)
    ).toBeVisible();
  });

  test("certificate entry can be removed", async ({ page }) => {
    await page.getByRole("button", { name: /add certificate/i }).click();
    await page.waitForSelector('[id^="certificates"][id$="name"]');

    await page.getByRole("button", { name: "Remove" }).nth(0).click();

    await expect(
      page.locator('[id^="certificates"][id$="name"]')
    ).not.toBeAttached();
  });
});
