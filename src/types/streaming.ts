export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface SSEWorkflowEvent {
  type: 'workflow_start' | 'step_update' | 'step_complete' | 'workflow_complete' | 'workflow_error' | 'connection_error';
  stepId?: string;
  stepName?: string;
  step_id?: string;  // Backend field
  step_name?: string;  // Backend field
  status?: 'pending' | 'running' | 'completed' | 'failed';
  data?: any;
  final_result?: any;  // Backend field
  message?: string;
  timestamp?: string;
  workflowId?: string;
}

export interface WorkflowStreamState {
  steps: WorkflowStep[];
  isConnected: boolean;
  isRunning: boolean;
  error: string | null;
  finalResponse: any | null;
  workflowId: string | null;
}

export interface UseWorkflowStreamOptions {
  onStepUpdate?: (step: WorkflowStep) => void;
  onWorkflowComplete?: (response: any) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export interface StreamWorkflowRequest {
  query: string;
  flowId?: string;
  workflowJson: {
    nodes: Array<{
      id: string;
      label: string;
      nodeType: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
    }>;
  };
}