import { ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";

const suggestions = [
  {
    text: "Summarize today's top Hacker News story",
    prompt: "Go to news.ycombinator.com and summarize the top story for me",
  },
  {
    text: "Create a markdown file with a meeting agenda",
    prompt: "Create a markdown file called meeting-agenda.md with a template for a team meeting agenda",
  },
  {
    text: "What's trending on GitHub this week?",
    prompt: "Go to github.com/trending and tell me what repositories are trending",
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
