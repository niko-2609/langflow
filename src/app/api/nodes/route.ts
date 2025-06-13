import { NextResponse } from 'next/server';
import { Phone, Mic, Brain, Sparkles, FileText, Send } from "lucide-react";
import { WorkflowNode } from '@/types/nodes';

export const nodes: WorkflowNode[] = [
  {
    type: 'callTrigger',
    label: 'Call Trigger',
    description: 'Triggers when a phone call is received',
    inputs: [],
    outputs: ['audioUrl'],
    icon: Phone,
    color: 'bg-blue-500',
  },
  {
    type: 'transcript',
    label: 'Transcript',
    description: 'Converts audio to text using Whisper',
    inputs: ['audioUrl'],
    outputs: ['transcript'],
    icon: Mic,
    color: 'bg-purple-500',
  },
  {
    type: 'llm',
    label: 'LLM',
    description: 'Calls an LLM with a given prompt',
    inputs: ['prompt'],
    outputs: ['response'],
    icon: Brain,
    color: 'bg-yellow-500',
  },
  {
    type: 'textCleaner',
    label: 'Text Cleaner',
    description: 'Cleans and normalizes text',
    inputs: ['text'],
    outputs: ['cleanText'],
    icon: Sparkles,
    color: 'bg-green-500',
  },
  {
    type: 'notionDoc',
    label: 'Notion Document',
    description: 'Creates a Notion document from content',
    inputs: ['title', 'content'],
    outputs: ['notionUrl'],
    icon: FileText,
    color: 'bg-orange-500',
  },
  {
    type: 'notionToEmail',
    label: 'Send Notion Email',
    description: 'Sends a Notion document as an email',
    inputs: ['notionUrl', 'recipientEmail'],
    outputs: [],
    icon: Send,
    color: 'bg-red-500',
  },
];

export async function GET() {
  return NextResponse.json(nodes);
}