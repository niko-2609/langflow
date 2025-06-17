import { NextResponse } from 'next/server';

import { WorkflowNode } from '@/types/nodes';

export const nodes: WorkflowNode[] = [
  {
    type: "classify_message",
    label: "Classifier",
    nodeType: "default",
    description: "Classifies whether a user query is a coding question",
    inputs: ["user_query"],
    outputs: ["is_coding_question"],
    color: "bg-cyan-500"
  },
  {
    type: "route_query",
    label: "Router Query",
    nodeType: "router",
    description: "Routes query to general or coding path",
    inputs: ["is_coding_question"],
    outputs: [],
    color: "bg-slate-500"
  },
  {
    type: "general_query",
    label: "General Query",
    nodeType: "default",
    description: "Handles non-coding user queries with general LLM",
    inputs: ["user_query"],
    outputs: ["llm_result"],
    color: "bg-yellow-500"
  },
  {
    type: "coding_query",
    label: "Coding Query",
    nodeType: "default",
    description: "Handles coding-related queries using GPT-4",
    inputs: ["user_query"],
    outputs: ["llm_result"],
    color: "bg-green-500"
  },
  {
    type: "coding_query_accuracy",
    label: "Coding Accuracy",
    nodeType: "default",
    description: "Evaluates the accuracy of the code returned",
    inputs: ["llm_result"],
    outputs: ["accuracy_percentage"],
    color: "bg-blue-600"
  }
]

   

export async function GET() {
  return NextResponse.json(nodes);
}