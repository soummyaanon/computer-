import { ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";

const SIMONMED_PROMPT = `Log in to my SimonMed Physician Portal and download all patient data.

  URL: https://images.simonmed.com/Portal/app#/
  Username: sdara
  Password: Cardio123@

PART 1 — LOGIN
  1. Open Firefox and go to the URL above. Wait for it to load.
  2. Click inside the Username field and type the username. Screenshot to confirm it appears; retype if empty.
  3. Click inside the Password field and type the password. Screenshot to confirm dots appear; retype if empty.
  4. Click the round arrow submit button next to the password field. If you cannot find it, press Enter as a fallback.
  5. Wait a few seconds, take a screenshot, and verify the login form is gone. If still on the login page, retry once.
  6. Dismiss any cookie or browser-support banners.

PART 2 — OPEN EACH PATIENT AND DOWNLOAD THEIR DATA
  7. Once on the dashboard, take a screenshot and identify the list of patients/studies.
  8. For EACH patient row in the list:
       a. DOUBLE-CLICK the patient row to open it (single click usually only selects — a double-click is required to open the study/details).
       b. Wait for the patient/study view to fully load, then take a screenshot.
       c. Find the download / export / save option (look for a download icon, "Export", "Save", or right-click → Download). Click it.
       d. If a dialog asks for format/options, accept the default and confirm. Save into /root/Downloads (or accept default).
       e. Wait for the download to complete, then take a screenshot.
       f. Go back to the patient list (browser back button or a "Back to list" link).
  9. Repeat step 8 for every patient until you have processed the whole list. Scroll the list if there are more rows below.
  10. After downloading all files, list /root/Downloads and /home/user/Downloads with bash to confirm files are there.
  11. Call the download tool with the absolute paths of every downloaded file so I can grab them from the chat.

GUIDANCE
  - This task may take a long time (many patients × multiple clicks each). Keep going step by step — do not stop early. Only finish after every patient has been processed and every file has been passed to the download tool.
  - When a single click does not open a patient, ALWAYS try a double-click before giving up.
  - If you get stuck on the portal UI (don't know which button to click, unfamiliar control, error message), use Firefox to do a Google search for the exact label or error to figure out the next step, then come back and continue.
  - After every form submission or button click, take a screenshot and verify the page actually changed before claiming success.`;

const suggestions = [
  {
    text: "Log in to SimonMed portal",
    prompt: SIMONMED_PROMPT,
  },
];

export const PromptSuggestions = ({
  submitPrompt,
  disabled,
}: {
  submitPrompt: (prompt: string) => void;
  disabled: boolean;
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="pill"
          size="pill"
          onClick={() => submitPrompt(suggestion.prompt)}
          disabled={disabled}
        >
          <span>
            <span className="text-black text-sm">
              {suggestion.text.toLowerCase()}
            </span>
          </span>
          <ArrowUpRight className="ml-1 h-2 w-2 sm:h-3 sm:w-3 text-zinc-500 group-hover:opacity-70" />
        </Button>
      ))}
    </div>
  );
};
