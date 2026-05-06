import { ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";

const SIMONMED_CREDENTIALS = `Try these SimonMed credentials in order until one works (stop on first success):
  1. URL https://images.simonmed.com/Portal/app  | username Sdara  | password Cardio@2025
  2. URL https://images.simonmed.com/Portal/app  | username sdara  | password Cardio2026@
  3. URL https://www.simonmed.com/login/authenticate/  | username sdara  | password Simon9123
If a login fails (wrong password, error message, or you stay on the login page), go back, clear the fields, and try the next row. Don't give up until all three have been tried.`;

const suggestions = [
  {
    text: "Log in to SimonMed portal",
    prompt:
      `${SIMONMED_CREDENTIALS}\n\nOnce logged in, stop at the dashboard and take a screenshot.`,
  },
  {
    text: "Download my latest patient documents",
    prompt:
      `${SIMONMED_CREDENTIALS}\n\nOnce logged in, open the most recent study, download all available documents into /root/Downloads, then call the download tool with each file path so I can grab them.`,
  },
  {
    text: "List available studies on SimonMed",
    prompt:
      `${SIMONMED_CREDENTIALS}\n\nOnce logged in, list all studies/exams visible on the dashboard with their dates.`,
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
