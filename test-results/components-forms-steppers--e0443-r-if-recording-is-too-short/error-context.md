# Test info

- Name: VoicemailModal >> should show error if recording is too short
- Location: C:\Users\tyriq\Documents\Github\LeadIgnite-Fork\components\forms\steppers\profile-form\steps\knowledge\voice\_tests\voice-modal.spec.ts:67:6

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByText('+ Record Voicemail')

    at C:\Users\tyriq\Documents\Github\LeadIgnite-Fork\components\forms\steppers\profile-form\steps\knowledge\voice\_tests\voice-modal.spec.ts:42:46
```

# Test source

```ts
   1 | // playwright/test for VoicemailModal UI/UX and interaction
   2 | // ! This test suite assumes the modal is triggered from the "+ Record Voicemail" button in the Knowledge Base step
   3 | // ! Audio recording is simulated due to browser/media restrictions in headless mode
   4 |
   5 | import { test, expect } from "@playwright/test";
   6 |
   7 | // Utility selectors
   8 | const selectors = {
   9 | 	recordVoicemailBtn: "text=Record Voicemail",
  10 | 	modalTitle: "text=Record Voicemail",
  11 | 	uiuxNote: "text=UI/UX recommends a recording length",
  12 | 	startRecordingBtn: 'button:has-text("Start Recording")',
  13 | 	stopRecordingBtn: 'button:has-text("Stop Recording")',
  14 | 	finishRecordingBtn: 'button:has-text("Finish Recording")',
  15 | 	audioPlayer: "audio",
  16 | 	closeModalBtn: 'button[aria-hidden="true"]', // X button
  17 | };
  18 |
  19 | test.describe("VoicemailModal", () => {
  20 | 	test.beforeEach(async ({ page }) => {
  21 | 		// Inject MediaRecorder mock so the modal works in headless/test
  22 | 		await page.addInitScript(() => {
  23 | 			// @ts-expect-error
  24 | 			window.MediaRecorder = class {
  25 | 				static isTypeSupported(_type: string) {
  26 | 					// Accept all types in test
  27 | 					return true;
  28 | 				}
  29 | 				start() {
  30 | 					setTimeout(() => this.ondataavailable({ data: new Blob() }), 500);
  31 | 				}
  32 | 				stop() {
  33 | 					setTimeout(() => this.onstop?.(), 100);
  34 | 				}
  35 | 				ondataavailable = (p0?: { data: Blob }) => {};
  36 | 				onstop = () => {};
  37 | 				state = "recording";
  38 | 			};
  39 | 		});
  40 | 		await page.goto("http://localhost:3000/dashboard/profile");
  41 | 		await page.getByText("Knowledge Base").click();
> 42 | 		await page.getByText("+ Record Voicemail").click();
     | 		                                           ^ Error: locator.click: Target page, context or browser has been closed
  43 | 	});
  44 |
  45 | 	test("should open the modal and show UI/UX note", async ({ page }) => {
  46 | 		await expect(page.getByText("Record Voicemail")).toBeVisible();
  47 | 		await expect(
  48 | 			page.getByText("UI/UX recommends a recording length"),
  49 | 		).toBeVisible();
  50 | 	});
  51 |
  52 | 	test("should start and stop recording, then show playback", async ({
  53 | 		page,
  54 | 	}) => {
  55 | 		// Start recording
  56 | 		await page.getByRole("button", { name: "Start Recording" }).click();
  57 | 		// Wait for the Stop Recording button to appear (max 5s)
  58 | 		await page.locator('button:has-text("Stop Recording")').waitFor({ timeout: 5000 });
  59 | 		await page.getByRole("button", { name: "Stop Recording" }).click();
  60 | 		// Should see Finish Recording and audio controls
  61 | 		await expect(
  62 | 			page.getByRole("button", { name: "Finish Recording" }),
  63 | 		).toBeVisible();
  64 | 		await expect(page.locator("audio")).toBeVisible();
  65 | 	});
  66 |
  67 | 	test("should show error if recording is too short", async ({ page }) => {
  68 | 		await page.getByRole("button", { name: "Start Recording" }).click();
  69 | 		await page.locator('button:has-text("Stop Recording")').waitFor({ timeout: 5000 });
  70 | 		await page.getByRole("button", { name: "Stop Recording" }).click();
  71 | 		await expect(page.getByText(/Recording too short/)).toBeVisible();
  72 | 	});
  73 |
  74 | 	test("should finish recording and close modal", async ({ page }) => {
  75 | 		await page.getByRole("button", { name: "Start Recording" }).click();
  76 | 		await page.locator('button:has-text("Stop Recording")').waitFor({ timeout: 5000 });
  77 | 		await page.getByRole("button", { name: "Stop Recording" }).click();
  78 | 		await page.getByRole("button", { name: "Finish Recording" }).click();
  79 | 		// Modal should close
  80 | 		await expect(page.getByText("Record Voicemail")).not.toBeVisible();
  81 | 	});
  82 |
  83 | 	test("should close modal by X button", async ({ page }) => {
  84 | 		await page.getByRole("button", { name: "" }).first().click(); // X button
  85 | 		await expect(page.getByText("Record Voicemail")).not.toBeVisible();
  86 | 	});
  87 |
  88 | 	// todo: Add accessibility checks (focus trap, keyboard nav, etc)
  89 | });
  90 |
```