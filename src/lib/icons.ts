import {
    Phone,
    Mic,
    Brain,
    Sparkles,
    FileText,
    Mail
  } from "lucide-react";


  export const nodeIcons: Record<string, React.ElementType> = {
    "callTrigger": Phone,
    "transcript": Mic,
    "llm": Brain,
    "textcleaner": Sparkles,
    "notionDoc": FileText,
    "notionToEmail": Mail,
  };