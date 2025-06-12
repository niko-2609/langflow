
'use client'

import { useCallback, useState } from 'react';
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
  Mail,
  Database,
  Webhook,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Menu,
  X
} from "lucide-react";
import Link from 'next/link'

// Custom node types
const nodeTypes = {};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    position: { x: 250, y: 25 },
    data: { label: 'Start Trigger' },
    style: {
      background: '#e3406f',
      color: 'white',
      border: '1px solid #e3406f',
      borderRadius: '8px',
    },
  },
];

const initialEdges: Edge[] = [];

const Workspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nodeId, setNodeId] = useState(2);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTemplates = [
    {
      type: 'trigger',
      label: 'Email Trigger',
      icon: Mail,
      color: 'bg-blue-500',
      description: 'Triggers when new email received'
    },
    {
      type: 'action',
      label: 'Database',
      icon: Database,
      color: 'bg-green-500',
      description: 'Read/write to database'
    },
    {
      type: 'action',
      label: 'Webhook',
      icon: Webhook,
      color: 'bg-purple-500',
      description: 'Send HTTP requests'
    },
    {
      type: 'action',
      label: 'Schedule',
      icon: Calendar,
      color: 'bg-orange-500',
      description: 'Time-based triggers'
    },
    {
      type: 'action',
      label: 'Slack',
      icon: MessageSquare,
      color: 'bg-pink-500',
      description: 'Send Slack messages'
    },
    {
      type: 'action',
      label: 'File Processing',
      icon: FileText,
      color: 'bg-indigo-500',
      description: 'Process files and documents'
    },
  ];

  const addNode = (template: typeof nodeTemplates[0]) => {
    const newNode: Node = {
      id: nodeId.toString(),
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { label: template.label },
      style: {
        background: template.color.replace('bg-', '#').replace('-500', ''),
        color: 'white',
        border: `1px solid ${template.color.replace('bg-', '#').replace('-500', '')}`,
        borderRadius: '8px',
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId((id) => id + 1);
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
          <Button className="w-full justify-start">
            <Save className="w-4 h-4 mr-2" />
            Save Workflow
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Play className="w-4 h-4 mr-2" />
            Test Run
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Workflow Settings
          </Button>
        </div>

        {/* Node Templates */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="font-semibold mb-4">Available Nodes</h3>
          <div className="space-y-3">
            {nodeTemplates.map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-all hover:scale-105 border-l-4"
                style={{ borderLeftColor: template.color.replace('bg-', '#').replace('-500', '') }}
                onClick={() => addNode(template)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${template.color} rounded-lg flex items-center justify-center`}>
                      <template.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm">{template.label}</CardTitle>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            ))}
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
              <h2 className="text-lg font-semibold hidden sm:block">Untitled Workflow</h2>
              <h2 className="text-base font-semibold sm:hidden">Workflow</h2>
              <Badge variant="secondary">Draft</Badge>
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
            // Mobile optimizations
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Controls
              className="bg-background border border-border rounded-lg shadow-lg"
              showInteractive={false}
            />
            <MiniMap
              className="bg-background border border-border rounded-lg hidden md:block" 
              maskColor="rgb(240, 240, 240, 0.6)"
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
        {nodes.length === 1 && (
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
    </div>
  );
};

export default Workspace;
