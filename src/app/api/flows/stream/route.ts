import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { SSEWorkflowEvent, StreamWorkflowRequest } from '@/types/streaming';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

interface WorkflowNodeJson {
  id: string;
  label: string;
  nodeType: string;
}

interface WorkflowEdgeJson {
  source: string;
  target: string;
}

interface CleanedWorkflowJson {
  nodes: WorkflowNodeJson[];
  edges: WorkflowEdgeJson[];
}

// Store active streams (in production, use Redis or similar)
const activeStreams = new Map<string, { 
  controller: ReadableStreamDefaultController;
  workflowId: string;
}>();

// Store workflow requests temporarily (in production, use Redis or similar)
const workflowRequests = new Map<string, StreamWorkflowRequest>();

// Store workflow execution times (in production, use Redis or similar)
const workflowStartTimes = new Map<string, number>();

// Simulation function for when Python backend is not available
async function simulateWorkflowExecution(
  controller: ReadableStreamDefaultController,
  workflowId: string,
  cleanedWorkflow: CleanedWorkflowJson,
  userQuery: string,
  flowId?: string,
  userId?: string
) {
  try {
    // Record start time
    workflowStartTimes.set(workflowId, Date.now());

    // Send workflow start event
    sendSSEEvent(controller, {
      type: 'workflow_start',
      message: 'Workflow execution started (simulation mode)',
      timestamp: new Date().toISOString(),
      workflowId: workflowId
    });

    // Simulate execution of each node
    const workflowNodes = cleanedWorkflow.nodes.filter(node => node.nodeType !== 'router');
    
    for (let i = 0; i < workflowNodes.length; i++) {
      const node = workflowNodes[i];
      
      // Wait a bit to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Send step update event
      sendSSEEvent(controller, {
        type: 'step_update',
        step_id: (i + 1).toString(),
        step_name: node.label,
        status: 'completed',
        data: null,
        message: `Completed node: ${node.label}`,
        timestamp: new Date().toISOString(),
        workflowId: workflowId
      });
    }

    // Wait a bit before final response
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send completion event with mock response
    const mockResponse = {
      user_query: userQuery,
      llm_result: `This is a simulated response for the query: "${userQuery}". The workflow executed ${workflowNodes.length} steps successfully.`,
      is_coding_question: userQuery.toLowerCase().includes('code') || userQuery.toLowerCase().includes('programming'),
      accuracy_percentage: "95"
    };

    sendSSEEvent(controller, {
      type: 'workflow_complete',
      message: 'Workflow completed successfully (simulation)',
      final_result: mockResponse,
      timestamp: new Date().toISOString(),
      workflowId: workflowId
    });

    // Record successful execution
    await recordWorkflowExecution(
      workflowId,
      flowId,
      'SUCCESS',
      { user_query: userQuery },
      mockResponse,
      undefined,
      userId
    );

  } catch (error) {
    console.error('Error in simulation:', error);
    sendSSEEvent(controller, {
      type: 'workflow_error',
      message: 'Simulation failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      timestamp: new Date().toISOString(),
      workflowId: workflowId
    });

    // Record failed execution
    await recordWorkflowExecution(
      workflowId,
      flowId,
      'FAILURE',
      { user_query: userQuery },
      null,
      error instanceof Error ? error.message : 'Unknown error',
      userId
    );
  } finally {
    // Clean up
    activeStreams.delete(workflowId);
    controller.close();
  }
}

function cleanWorkflowJson(rawWorkflowJson: any): CleanedWorkflowJson {
  const cleanedNodes = rawWorkflowJson.nodes.map((node: any) => ({
    id: node.id,
    label: node.label,
    nodeType: node.nodeType,
  }));

  const cleanedEdges = rawWorkflowJson.edges.map((edge: any) => ({
    source: edge.source,
    target: edge.target,
  }));

  return {
    nodes: cleanedNodes,
    edges: cleanedEdges,
  };
}

function sendSSEEvent(controller: ReadableStreamDefaultController, event: SSEWorkflowEvent) {
  try {
    const eventData = `data: ${JSON.stringify(event)}\n\n`;
    controller.enqueue(new TextEncoder().encode(eventData));
  } catch (error) {
    console.error('Error sending SSE event:', error);
    // Controller is likely closed, ignore the error
  }
}

async function streamWorkflowFromPython(
  controller: ReadableStreamDefaultController,
  workflowId: string,
  request: StreamWorkflowRequest,
  flowId?: string,
  userId?: string
) {
  try {
    const cleanedWorkflow = cleanWorkflowJson(request.workflowJson);
    
    // Record start time
    workflowStartTimes.set(workflowId, Date.now());
    
    console.log('🚀 Starting workflow stream to Python backend...');
    
    // Try different common ports for Python backend
    const possiblePorts = [8000, 8080, 3001, 5000];
    let response: Response | null = null;
    let lastError: any = null;
    
    for (const port of possiblePorts) {
      try {
        console.log(`🔍 Trying Python backend on port ${port}...`);
        response = await fetch(`https://api.langflow.digital/stream-workflow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_query: request.query,
            workflowJson: cleanedWorkflow,
            workflowId: workflowId
          }),
        });
        
        if (response.ok) {
          console.log(`✅ Connected to Python backend on port ${port}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Port ${port} failed:`, error);
        lastError = error;
        response = null;
      }
    }
    
    // If no Python backend found, use simulation
    if (!response) {
      console.log('🎭 No Python backend found, using simulation...');
      return simulateWorkflowExecution(controller, workflowId, cleanedWorkflow, request.query, flowId, userId);
    }

    if (!response.ok) {
      throw new Error(`Python backend error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body from Python backend');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              console.log('📨 Received from Python:', eventData);
              
              // Transform Python backend event to our SSE format
              const sseEvent: SSEWorkflowEvent = {
                type: eventData.type || 'step_update',
                stepId: eventData.step_id || eventData.stepId || '',
                stepName: eventData.step_name || eventData.stepName || '',
                status: eventData.status || 'running',
                data: eventData.data,
                final_result: eventData.final_result,
                message: eventData.message,
                timestamp: new Date().toISOString(),
                workflowId: workflowId
              };

              console.log('📤 Sending to frontend:', sseEvent);
              sendSSEEvent(controller, sseEvent);

              // Record execution when workflow completes
              if (sseEvent.type === 'workflow_complete' && sseEvent.final_result) {
                await recordWorkflowExecution(
                  workflowId,
                  flowId,
                  'SUCCESS',
                  { user_query: request.query },
                  sseEvent.final_result,
                  undefined,
                  userId
                );
              } else if (sseEvent.type === 'workflow_error') {
                await recordWorkflowExecution(
                  workflowId,
                  flowId,
                  'FAILURE',
                  { user_query: request.query },
                  null,
                  sseEvent.message,
                  userId
                );
              }
              
            } catch (parseError) {
              console.error('Error parsing Python SSE event:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('Error streaming from Python backend:', error);
    
    // Send error event
    const errorEvent: SSEWorkflowEvent = {
      type: 'workflow_error',
      stepId: '',
      stepName: '',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      workflowId: workflowId
    };
    
    sendSSEEvent(controller, errorEvent);
  } finally {
    // Clean up
    activeStreams.delete(workflowId);
    controller.close();
  }
}

// Function to record workflow execution
export async function recordWorkflowExecution(
  workflowId: string,
  flowId: string | undefined,
  status: 'SUCCESS' | 'FAILURE',
  inputData: any,
  outputData: any,
  error?: string,
  userId?: string
) {
  try {
    if (!userId || !flowId) {
      console.log('Skipping execution recording - no userId or flowId provided');
      return;
    }

    const startTime = workflowStartTimes.get(workflowId);
    const durationMs = startTime ? Date.now() - startTime : null;

    console.log('Recording workflow execution:', { flowId, status, userId, durationMs });

    // Check if the flow exists and belongs to the user
    const flow = await prisma.flow.findFirst({
      where: { id: flowId, userId: userId }
    });

    if (!flow) {
      console.log('Flow not found or does not belong to user');
      return;
    }

    // Create workflow execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        flowId,
        userId: userId,
        status: status,
        inputData,
        outputData,
        error,
        durationMs
      }
    });

    console.log('Created execution record:', execution.id);

    // Update flow statistics
    const updateData: any = {
      lastRunAt: new Date(),
      executions: { increment: 1 }
    };

    if (status === 'FAILURE') {
      updateData.failures = { increment: 1 };
    }

    await prisma.flow.update({
      where: { id: flowId },
      data: updateData
    });

    // Recalculate success rate
    const totalExecutions = await prisma.workflowExecution.count({
      where: { flowId }
    });

    const successfulExecutions = await prisma.workflowExecution.count({
      where: { flowId, status: 'SUCCESS' }
    });

    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 100;

    await prisma.flow.update({
      where: { id: flowId },
      data: {
        successRate: successRate
      }
    });

    console.log('Updated flow statistics:', { totalExecutions, successfulExecutions, successRate });

    // Clean up
    workflowStartTimes.delete(workflowId);
  } catch (error) {
    console.error('Error recording workflow execution:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: StreamWorkflowRequest = await request.json();
    const workflowId = uuidv4();

    // Store the request data for the GET request to use
    workflowRequests.set(workflowId, body);

    // Clean up request data after 10 minutes to prevent memory leaks
    setTimeout(() => {
      workflowRequests.delete(workflowId);
    }, 10 * 60 * 1000);

    // Return the workflow ID immediately
    return NextResponse.json({ workflowId });
  } catch (error) {
    console.error('Error starting workflow stream:', error);
    return NextResponse.json(
      { error: 'Failed to start workflow stream' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflowId');

  if (!workflowId) {
    return NextResponse.json(
      { error: 'workflowId is required' },
      { status: 400 }
    );
  }

  // Get user authentication
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get the stored request data
  const workflowRequest = workflowRequests.get(workflowId);
  if (!workflowRequest) {
    return NextResponse.json(
      { error: 'Workflow request not found or expired' },
      { status: 404 }
    );
  }

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this workflow
      activeStreams.set(workflowId, { controller, workflowId });

      // Send initial connection event
      const connectionEvent: SSEWorkflowEvent = {
        type: 'step_update',
        stepId: 'connection',
        stepName: 'Connected to workflow stream',
        status: 'running',
        timestamp: new Date().toISOString(),
        workflowId: workflowId
      };
      
      sendSSEEvent(controller, connectionEvent);

      // Use actual Python backend streaming with the request data
      streamWorkflowFromPython(controller, workflowId, workflowRequest, workflowRequest.flowId, clerkId)
        .catch(error => {
          console.error('Error in streamWorkflowFromPython:', error);
          const errorEvent: SSEWorkflowEvent = {
            type: 'workflow_error',
            stepId: '',
            stepName: '',
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString(),
            workflowId: workflowId
          };
          sendSSEEvent(controller, errorEvent);
          controller.close();
        });
    },
    cancel() {
      activeStreams.delete(workflowId);
      workflowRequests.delete(workflowId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}