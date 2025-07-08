'use client'

import { Key, useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MiniMap,
  Node as FlowNode,
  Edge as FlowEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  Save,
  Play,
  Plus,
  Settings,
  Menu,
  X,
  Sparkles,
  TestTube2
} from "lucide-react";
import Link from 'next/link'
import { useAvailableNodes } from '@/hooks/availableNodes';
import { WorkflowNode } from '@/types/nodes';
import { nodeIcons } from '@/lib/icons'
import { useToast } from '@/hooks/use-toast';
import StartWorkflowForm from '@/components/features/workspace/StartWorkflow';
import { WorkflowExecutionCard } from '@/components/features/workspace/WorkflowExecutionCard';
import { WorkflowResponseDisplay } from '@/components/features/workspace/WorkflowResponseDisplay';
import { CustomNode } from '@/components/features/workspace/CustomNode';
import { useWorkflowStream } from '@/hooks/useWorkflowStream';
import { StreamWorkflowRequest } from '@/types/streaming';
import { useSearchParams } from 'next/navigation';

// Custom node types
const nodeTypes = {};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

const Workspace = () => {
  const searchParams = useSearchParams();
  const flowId = searchParams.get('flowId');
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nodeId, setNodeId] = useState(2);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: '', description: '', organizationId: '', isPublic: false });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [workflowJson, setWorkflowJson] = useState<WorkflowJson>({ nodes: [], edges: [], selected: [] });
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(flowId);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);

  // In your Workspace component
  const [showStartForm, setShowStartForm] = useState(false);


  const { toast } = useToast();


  const startWorkflow = async () => {
    try {
      const response = await fetch('/api/flows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: workflowJson }),
      });
      console.log(response);
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  }

  // Define types for workflow JSON
  interface WorkflowNodeJson {
    id: string;
    label: string;
    type: string | undefined | unknown;
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
    // Execution card
  const [showExecutionCard, setShowExecutionCard] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
  }[]>([]);
  const [executionRunning, setExecutionRunning] = useState(false);
  const [executionWorkflowName, setExecutionWorkflowName] = useState('Untitled Workflow');

  // Response display state
  const [showResponseDisplay, setShowResponseDisplay] = useState(false);
  const [workflowResponse, setWorkflowResponse] = useState<any>(null);
  
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
 
  // SSE Streaming hook
  const {
    steps: streamSteps,
    isConnected,
    isRunning: streamRunning,
    error: streamError,
    finalResponse,
    startWorkflow: startStreamWorkflow,
    stopWorkflow: stopStreamWorkflow,
    resetWorkflow,
    closeConnection
  } = useWorkflowStream({
    onStepUpdate: (step) => {
      console.log('Step update:', step);
    },
    onWorkflowComplete: (response) => {
      console.log('✅ Workflow completed with response:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', response ? Object.keys(response) : 'null');
      
      // Show response for any non-null response
      if (response !== null && response !== undefined) {
        const formattedResponse = {
          result: response,
          status: 'success',
          timestamp: new Date().toISOString()
        };
        console.log('📤 Setting workflow response:', formattedResponse);
        setWorkflowResponse(formattedResponse);
        setShowExecutionCard(false);
        setShowResponseDisplay(true);
        
        // Close the SSE connection since we have the final response
        closeConnection();
      } else {
        console.log('❌ No valid response to display');
      }
    },
    onError: (error) => {
      console.error('Workflow error:', error);
      toast({
        title: 'Workflow Error',
        description: error,
        variant: 'destructive'
      });
    }
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );



  useEffect(() => {
    const nodesWithTypes: WorkflowNodeJson[] = nodes.map((node: Node) => {
      const incomingEdges = edges.filter((e) => e.target === node.id);
      const outgoingEdges = edges.filter((e) => e.source === node.id);
  
      let nodeType: 'start' | 'end' | 'intermediate' | 'router' ;
      if (node.data.label === 'Router Query') nodeType = 'router';
      else if (incomingEdges.length === 0) nodeType = 'start';
      else if (outgoingEdges.length === 0) nodeType = 'end';
      else nodeType = 'intermediate';
  
      const baseNode: WorkflowNodeJson = {
        id: node.id,
        label: typeof node?.data?.label === 'string' ? node?.data?.label : '',
        type: node?.data?.type,
        nodeType,
        position: node.position,
      };
  
      return nodeType === 'router'
        ? { ...baseNode, routes: outgoingEdges.map((e) => e.target) }
        : baseNode;
    });
  
    const edgeList: WorkflowEdgeJson[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));
  
    setWorkflowJson({
      nodes: nodesWithTypes,
      edges: edgeList,
      selected: selectedNodes,
    });
  }, [nodes, edges, selectedNodes]);

  // Load workflow if flowId is provided
  useEffect(() => {
    if (flowId && !isLoadingWorkflow) {
      const loadWorkflow = async () => {
        setIsLoadingWorkflow(true);
        try {
          const response = await fetch(`/api/flows/${flowId}`);
          if (!response.ok) {
            throw new Error('Failed to load workflow');
          }
          
          const flow = await response.json();
          
          // Set form data
          setSaveForm({
            name: flow.name,
            description: flow.description || '',
            organizationId: '',
            isPublic: flow.isPublic
          });
          
          // Load workflow data if available
          if (flow.data && flow.data.nodes && flow.data.edges) {
            // Convert saved workflow data back to React Flow format
            const loadedNodes: Node[] = flow.data.nodes.map((node: any, index: number) => ({
              id: node.id,
              type: 'custom',
              position: node.position || { x: 100 + (index * 200), y: 100 + (index * 100) },
              data: {
                label: node.label,
                type: node.type,
                nodeType: node.nodeType,
                // Add other node data as needed
              }
            }));
            
            const loadedEdges: Edge[] = flow.data.edges.map((edge: any) => ({
              id: `${edge.source}-${edge.target}`,
              source: edge.source,
              target: edge.target,
            }));
            
            setNodes(loadedNodes);
            setEdges(loadedEdges);
            setCurrentFlowId(flow.id);
          }
          
          toast({
            title: 'Workflow Loaded',
            description: `Loaded workflow: ${flow.name}`,
          });
          
        } catch (error) {
          console.error('Error loading workflow:', error);
          toast({
            title: 'Error',
            description: 'Failed to load workflow',
            variant: 'destructive'
          });
        } finally {
          setIsLoadingWorkflow(false);
        }
      };
      
      loadWorkflow();
    }
  }, [flowId, toast]);

  // Handler for selection change
  const onSelectionChange = useCallback((params: { nodes: FlowNode[] }) => {
    setSelectedNodes(params.nodes.map((n) => n.id));
  }, []);

  // Handler for node drag stop (optional, for real-time update)
  const onNodeDragStop = useCallback(() => {
    // Triggers useEffect to update JSON
    setNodes(nodes => [...nodes]);
  }, [setNodes]);

  // Fetch nodes
  const { data, isLoading, error } = useAvailableNodes()

  if (isLoading) return <div>Loading nodes...</div>
  if (error) return <div>Error loading nodes...</div>

  const addNode = (template: typeof data[0]) => {
    const newNode: Node = {
      id: nodeId.toString(),
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: template.label,
        description: template.description,
        inputs: template.inputs,
        outputs: template.outputs,
        color: template.color,
        nodeType: template.nodeType,
        type: template.type,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId((id) => id + 1);
  };

  // Save handler
  async function handleSave() {
    setIsSaving(true);
    try {
      let res;
      if (currentFlowId) {
        // Update existing workflow
        res = await fetch(`/api/flows/${currentFlowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: saveForm.name,
            description: saveForm.description,
            isPublic: saveForm.isPublic,
            data: workflowJson,
          }),
        });
      } else {
        // Create new workflow
        res = await fetch('/api/flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: saveForm.name,
            description: saveForm.description,
            organizationId: saveForm.organizationId,
            isPublic: saveForm.isPublic,
            data: workflowJson,
            lastRunTime: lastRunTime,
          }),
        });
      }
      
      if (!res.ok) throw new Error(await res.text());
      
      const savedFlow = await res.json();
      if (!currentFlowId) {
        setCurrentFlowId(savedFlow.id);
      }
      
      toast({
        title: 'Success!',
        description: currentFlowId ? 'Your workflow was updated.' : 'Your workflow was saved.',
      })
      setShowSaveDialog(false);
    } catch (e: any) {
      toast({
        title: 'Failed',
        description: 'Could not save workflow, please try again.',
      })
    } finally {
      setIsSaving(false);
    }
  }

  // Test Run handler
  async function handleTestRun() {
    setIsTesting(true);
    setLastRunTime(new Date());
    setShowStartForm(true);
  }




  async function startTestRun(userQuery: string) {
      // Use SSE streaming
      const streamRequest: StreamWorkflowRequest = {
        query: userQuery,
        flowId: currentFlowId || undefined,
        workflowJson: {
          nodes: workflowJson.nodes.map(node => ({
            id: node.id,
            label: node.label,
            nodeType: node.nodeType
          })),
          edges: workflowJson.edges
        }
      };

      console.log('🎯 Starting workflow execution');
      console.log('🔍 Full workflow JSON:', workflowJson);
      
      setExecutionSteps([]);
      setShowStartForm(false);
      setIsTesting(false);
      setShowExecutionCard(true);
      setExecutionWorkflowName(saveForm.name || 'Untitled Workflow');
      
      await startStreamWorkflow(streamRequest);

  }

  const handleStopExecution = () => {
      stopStreamWorkflow();
      closeConnection(); // Close SSE connection when user stops
  };

  const handleCloseExecution = () => {
    setShowExecutionCard(false);
    if (isConnected) {
      closeConnection(); // Close SSE connection when user closes execution card
    }
  };

  const handleCloseResponse = () => {
    setShowResponseDisplay(false);
    // Connection should already be closed when response is shown, but just in case
    if (isConnected) {
      closeConnection();
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-80 border-r border-border bg-background flex flex-col
        fixed lg:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Workflow className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">FlowCraft</span>
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Workflow Builder</h1>
            <p className="text-sm text-muted-foreground">
              Drag nodes to the canvas to build your workflow
            </p>
          </div>
        </div>


        {/* Workflow Actions */}
        <div className="p-6 border-b border-border space-y-3">
          <Button className="w-full justify-start" onClick={() => setShowSaveDialog(true)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save Workflow
          </Button>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={handleTestRun} disabled={isTesting}>
              <TestTube2 className="w-4 h-4 mr-2" />
              Test Run 
            </Button>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={startWorkflow}>
            <Play className="w-4 h-4 mr-2" />
            Run workflow
          </Button>
        </div>


        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="font-semibold mb-4">Available Nodes</h3>
          <div className="space-y-3">
            {data.map((template: WorkflowNode, index: Key | null | undefined) => {
              let Icon = nodeIcons[template.type] || Sparkles
              return (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all hover:scale-105 rounded-md"
                  style={{ borderLeft: `4px solid ${template.color}` }}
                  onClick={() => addNode(template)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${template.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white border-none" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm">{template.label}</CardTitle>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        {/* Canvas Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold hidden sm:block">{saveForm.name || 'Untitled Workflow'}</h2>
              <h2 className="text-base font-semibold sm:hidden">{saveForm.name || 'Workflow'}</h2>
              <Badge variant="secondary">{currentFlowId ? 'Saved' : 'Draft'}</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                {nodes.length} nodes • {edges.length} connections
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
           </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="h-full pt-16">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="bg-background"
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            onSelectionChange={onSelectionChange}
            onNodeDragStop={onNodeDragStop}
          >
            <Controls
              className="bg-background border border-border rounded-lg shadow-lg"
              showInteractive={false}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#e5e7eb"
            />

          </ReactFlow>
        </div>

        {/* Instructions Overlay */}
        {nodes.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Card className="p-8 text-center max-w-md animate-fade-in">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Start Building Your Workflow</h3>
                <p className="text-muted-foreground">
                  Click on any node from the sidebar to add it to your canvas, then connect them to create your automation flow.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Save Workflow</h2>
            <label className="block mb-2">Name
              <input className="w-full border p-2 rounded mb-2" value={saveForm.name} onChange={e => setSaveForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label className="block mb-2">Description
              <input className="w-full border p-2 rounded mb-2" value={saveForm.description} onChange={e => setSaveForm(f => ({ ...f, description: e.target.value }))} />
            </label>
            <label className="block mb-2">Organization ID
              <input className="w-full border p-2 rounded mb-2" value={saveForm.organizationId} onChange={e => setSaveForm(f => ({ ...f, organizationId: e.target.value }))} />
            </label>
            <label className="block mb-2">Public?
              <input type="checkbox" checked={saveForm.isPublic} onChange={e => setSaveForm(f => ({ ...f, isPublic: e.target.checked }))} />
            </label>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={isSaving}>Save</Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* In your JSX, add this where you want the modal to appear: */}
      {showStartForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <StartWorkflowForm startRun={startTestRun} />
            <Button variant="outline" className="mt-4 w-full" onClick={() => setShowStartForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Workflow Execution Card Overlay */}
      <WorkflowExecutionCard
        isVisible={showExecutionCard}
        workflowName={executionWorkflowName}
        steps={streamSteps}
        isRunning={streamRunning}
        onStop={handleStopExecution}
        onClose={handleCloseExecution}
      />

      {/* Workflow Response Display */}
      <WorkflowResponseDisplay
        isVisible={showResponseDisplay}
        response={workflowResponse}
        workflowName={executionWorkflowName}
        onClose={handleCloseResponse}
      />
    </div>
  );
};

export default Workspace;
