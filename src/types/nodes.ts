import { LucideIcon } from "lucide-react";

export interface WorkflowNode {
    type: string;
    label: string;
    description: string;
    inputs: string[];
    outputs: string[];
    icon: LucideIcon; // ✅ icon is a React component
    color: string;     // Tailwind color, e.g. "bg-blue-500"
  }


  
  