/**
 * ============================================================================
 * "Join the Studio" newsletter → Google Sheet
 * ============================================================================
 *
 * SETUP (about 5 minutes, one time):
 *
 * 1. Go to sheets.google.com and create a new, blank spreadsheet.
 *    Name it something like "Studio Newsletter Signups".
 *
 * 2. In row 1, add two column headers: Timestamp | Email
 *
 * 3. Go to Extensions → Apps Script. This opens a code editor in a new tab.
 *
 * 4. Delete whatever's in the editor (usually a blank "myFunction(){}") and
 *    paste in EVERYTHING below this comment block (the doPost function).
 *
 * 5. Click the disk/Save icon (or Ctrl+S / Cmd+S).
 *
 * 6. Click "Deploy" (top right) → "New deployment".
 *      - Click the gear icon next to "Select type" → choose "Web app".
 *      - Description: anything, e.g. "Newsletter form"
 *      - Execute as: Me (your email)
 *      - Who has access: Anyone
 *    Click "Deploy".
 *
 * 7. The first time, Google will show an "authorize" prompt since this is
 *    your own unverified script. Click "Authorize access", pick your
 *    account, then on the "Google hasn't verified this app" screen click
 *    "Advanced" → "Go to [project name] (unsafe)". This is normal and safe
 *    — it's just Google being cautious about scripts that write to your own
 *    Sheets, which is exactly what this one does and nothing else.
 *
 * 8. Copy the "Web app URL" it gives you — it looks like:
 *    https://script.google.com/macros/s/AKfycb.../exec
 *
 * 9. Open script.js, find SHEET_ENDPOINT near the top of the
 *    "Newsletter form" section, and paste your URL in between the quotes,
 *    replacing PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE.
 *
 * That's it — every "Join the Studio" submission on your site will now add
 * a row to this sheet automatically.
 *
 * A couple of things worth knowing:
 *  - If you ever edit this script again, you need to create a NEW
 *    deployment (Deploy → Manage deployments → pencil icon → New version)
 *    for the changes to actually go live — just saving isn't enough.
 *  - "Who has access: Anyone" is required for your website (a stranger's
 *    browser) to be able to submit to it — that's normal for this kind of
 *    setup and only lets people ADD a row, not read or edit your sheet.
 * ============================================================================
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  var email = (e.parameter.EMAIL || '').trim();

  if (email) {
    sheet.appendRow([new Date(), email]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
