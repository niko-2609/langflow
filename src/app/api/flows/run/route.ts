import { NextResponse } from "next/server"


interface WorkflowNodeJson {
    id: string;
    label: string;
    type: string | undefined;
    nodeType: 'start' | 'end' | 'intermediate' | 'router';
    position: { x: number; y: number };
    routes?: string[]; // Only for router nodes
  }
  interface WorkflowEdgeJson {
    source: string;
    target: string;
  }
interface WorkflowJson {
    nodes: WorkflowNodeJson[];
    edges: WorkflowEdgeJson[];
    selected: string[];
    }


export async function POST(req: Request) {
    const body = await req.json()

    const cleanedWorkflow = cleanWorkflowJson(body.data)
    console.log(cleanedWorkflow)


    const response = await fetch('http://localhost:8080/run-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: body.query,
          workflowJson: cleanedWorkflow,
        }),
      });
    
      const result = await response.json();
     console.log(result)

     return NextResponse.json({"message": "request processed"})
}


function cleanWorkflowJson(rawWorkflowJson: WorkflowJson) {
    const cleanedNodes = rawWorkflowJson.nodes.map(node => ({
      id: node.id,
      label: node.label,
      nodeType: node.nodeType,
    }));
  
    const cleanedEdges = rawWorkflowJson.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
    }));
  
    return {
      nodes: cleanedNodes,
      edges: cleanedEdges,
    };
  }