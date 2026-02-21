import { Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Personal Info
// ---------------------------------------------------------------------------

/**
 * Fill all required personal info fields.
 *
 * Default values represent a realistic but obviously-fictional test persona so
 * that any PDF output produced during E2E runs is clearly synthetic.
 */
export async function fillPersonalInfo(
  page: Page,
  opts?: {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    email?: string;
    phone?: string;
  }
) {
  const o = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    ...opts,
  };

  await page.fill("#firstName", o.firstName);
  await page.fill("#lastName", o.lastName);

  // nickname is optional on the form; only fill it when the caller provides a value.
  if (o.nickname !== undefined) {
    await page.fill("#nickname", o.nickname);
  }

  await page.fill("#email", o.email);
  await page.fill("#phone", o.phone);
}

// ---------------------------------------------------------------------------
// Professional Summary
// ---------------------------------------------------------------------------

/**
 * Fill the professional summary textarea.
 *
 * The textarea is located by its visible label text so this helper stays
 * robust even if the underlying HTML id changes.
 */
export async function fillSummary(
  page: Page,
  text = "Experienced software engineer."
) {
  // The textarea has id="summary"; use it directly.
  await page.locator("#summary").fill(text);
}

// ---------------------------------------------------------------------------
// Work Experience
// ---------------------------------------------------------------------------

/**
 * Click "Add Work Experience", wait for the new card, and populate its fields.
 *
 * The helper derives the correct entry index from the number of company inputs
 * already present before the click, so it is safe to call multiple times in
 * sequence to build up several experience entries.
 */
export async function addExperience(
  page: Page,
  opts?: {
    company?: string;
    position?: string;
    startMonth?: string;
    startYear?: string;
    description?: string;
    /** When true the "Currently working here" checkbox is checked. */
    isCurrent?: boolean;
  }
) {
  const o = {
    company: "Acme Corp",
    position: "Software Engineer",
    startMonth: "Jan",
    startYear: "2022",
    description: "Built scalable backend services.",
    isCurrent: true,
    ...opts,
  };

  await page.getByRole("button", { name: /add experience/i }).click();

  // Wait for the newly-added card's company input to appear in the DOM.
  await page.waitForSelector('[id^="experience"][id$="company"]');

  // All existing company inputs; the last one belongs to the entry just added.
  const companyInputs = page.locator('[id^="experience"][id$="company"]');
  const idx = (await companyInputs.count()) - 1;

  await companyInputs.nth(idx).fill(o.company);

  const positionInputs = page.locator('[id^="experience"][id$="position"]');
  await positionInputs.nth(idx).fill(o.position);

  // Start month / year are rendered as <select> elements with only name attributes.
  const startMonthSelects = page.locator(
    'select[name^="experience."][name$=".startMonth"]'
  );
  await startMonthSelects.nth(idx).selectOption(o.startMonth);

  const startYearSelects = page.locator(
    'select[name^="experience."][name$=".startYear"]'
  );
  await startYearSelects.nth(idx).selectOption(o.startYear);

  if (o.isCurrent) {
    const isCurrentCheckboxes = page.locator(
      '[id^="experience"][id$="isCurrent"]'
    );
    await isCurrentCheckboxes.nth(idx).check();
  }

  const descTextareas = page.locator('[id^="experience"][id$="description"]');
  await descTextareas.nth(idx).fill(o.description);
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

/**
 * Click "Add Skill" and fill in the new skill value input.
 *
 * Like addExperience, this helper is safe to call in a loop to populate
 * multiple skills — it always targets the last input in the list.
 */
export async function addSkill(page: Page, value = "TypeScript") {
  await page.getByRole("button", { name: /add skill/i }).click();

  const skillInputs = page.locator('[name^="skills."][name$=".value"]');
  const idx = (await skillInputs.count()) - 1;

  await skillInputs.nth(idx).fill(value);
}
