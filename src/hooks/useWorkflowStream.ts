import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  WorkflowStep, 
  SSEWorkflowEvent, 
  WorkflowStreamState, 
  UseWorkflowStreamOptions,
  StreamWorkflowRequest 
} from '@/types/streaming';

export function useWorkflowStream(options: UseWorkflowStreamOptions = {}) {
  const {
    onStepUpdate,
    onWorkflowComplete,
    onError,
    autoReconnect = true,
    maxReconnectAttempts = 3
  } = options;

  const [state, setState] = useState<WorkflowStreamState>({
    steps: [],
    isConnected: false,
    isRunning: false,
    error: null,
    finalResponse: null,
    workflowId: null
  });

  const hasCompletedRef = useRef(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const handleSSEEvent = useCallback((event: SSEWorkflowEvent) => {
    // Debug logging to see what we're receiving
    console.log('🔍 SSE Event received:', event);
    
    // Handle both frontend and backend event structures
    const stepId = event.stepId || event.step_id || '';
    const stepName = event.stepName || event.step_name || '';
    const status = event.status || 'running';
    const { type, data, message } = event;

    switch (type) {
      case 'workflow_start':
        setState(prev => ({
          ...prev,
          isRunning: true,
          error: null
        }));
        break;

      case 'step_update':
        // Skip connection step as it's just for status, not a workflow step
        if (stepId === 'connection') {
          return;
        }
        
        console.log('📝 Processing step update:', { stepId, stepName, status });
        
        setState(prev => {
          console.log('🔍 Current steps:', prev.steps);
          console.log('🔍 Looking for step with name:', stepName, 'or id:', stepId);
          
          // Try multiple matching strategies
          const existingStepIndex = prev.steps.findIndex(s => {
            // Direct matches
            if (s.id === stepName || s.name === stepName || s.id === stepId) return true;
            
            // Partial matches for function names
            if (stepName && (s.name.includes(stepName) || stepName.includes(s.name))) return true;
            
            return false;
          });
          
          if (existingStepIndex >= 0) {
            // Update existing step
            const newSteps = [...prev.steps];
            newSteps[existingStepIndex] = { ...newSteps[existingStepIndex], status: 'completed' };
            console.log('📋 Updated step:', newSteps[existingStepIndex]);
            return { ...prev, steps: newSteps };
          } else {
            // Add new step if not found
            const newStep = { id: stepName || stepId, name: stepName, status: 'completed' as const };
            console.log('➕ Adding new step:', newStep);
            return { ...prev, steps: [...prev.steps, newStep] };
          }
        });
        
        if (onStepUpdate) {
          onStepUpdate({ id: stepId, name: stepName, status: 'completed' });
        }
        break;

      case 'step_complete':
        setState(prev => {
          const newSteps = prev.steps.map(step => 
            step.id === stepId ? { ...step, status: 'completed' as const } : step
          );
          return { ...prev, steps: newSteps };
        });
        break;

      case 'workflow_complete':
        console.log('✅ Workflow completed, full event:', event);
        console.log('✅ Event data:', data);
        console.log('✅ Event final_result:', event.final_result);
        
        // Prevent multiple completion callbacks
        if (hasCompletedRef.current) {
          console.log('🚫 Workflow already completed, ignoring duplicate completion event');
          return;
        }
        hasCompletedRef.current = true;
        
        // Handle both direct response and nested final_result
        const finalResult = event.final_result || data || event;
        console.log('📋 Final result to pass:', finalResult);
        
        setState(prev => ({
          ...prev,
          isRunning: false,
          finalResponse: finalResult
        }));
        
        // Close EventSource connection since workflow is complete
        if (eventSourceRef.current) {
          console.log('🔌 Closing EventSource connection');
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        if (onWorkflowComplete) {
          console.log('🎯 Calling onWorkflowComplete with:', finalResult);
          onWorkflowComplete(finalResult);
        } else {
          console.log('❌ No onWorkflowComplete callback available');
        }
        break;

      case 'workflow_error':
        setState(prev => ({
          ...prev,
          isRunning: false,
          error: message || 'Workflow execution failed'
        }));
        
        // Close EventSource connection on error
        if (eventSourceRef.current) {
          console.log('🔌 Closing EventSource connection due to error');
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        if (onError) {
          onError(message || 'Workflow execution failed');
        }
        break;

      case 'connection_error':
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: message || 'Connection error'
        }));
        break;
    }
  }, [onStepUpdate, onWorkflowComplete, onError]);

  const connect = useCallback((workflowId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/flows/stream?workflowId=${workflowId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        error: null
      }));
      reconnectAttemptsRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEWorkflowEvent = JSON.parse(event.data);
        handleSSEEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = () => {
      setState(prev => ({
        ...prev,
        isConnected: false
      }));

      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(workflowId);
        }, Math.pow(2, reconnectAttemptsRef.current) * 1000); // Exponential backoff
      }
    };

    return eventSource;
  }, [handleSSEEvent, autoReconnect, maxReconnectAttempts]);

  const startWorkflow = useCallback(async (request: StreamWorkflowRequest, initialSteps?: WorkflowStep[]) => {
    try {
      // Reset completion flag
      hasCompletedRef.current = false;
      
      setState(prev => ({
        ...prev,
        steps: [],
        isRunning: true,
        error: null,
        finalResponse: null
      }));

      // Start the workflow
      const response = await fetch('/api/flows/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { workflowId } = await response.json();
      
      setState(prev => ({
        ...prev,
        workflowId
      }));

      // Connect to the SSE stream
      connect(workflowId);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Failed to start workflow'
      }));
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to start workflow');
      }
    }
  }, [connect, onError]);

  const stopWorkflow = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      isConnected: false
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    stopWorkflow();
    hasCompletedRef.current = false;
    setState({
      steps: [],
      isConnected: false,
      isRunning: false,
      error: null,
      finalResponse: null,
      workflowId: null
    });
  }, [stopWorkflow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWorkflow();
    };
  }, [stopWorkflow]);

  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🔌 Manually closing EventSource connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setState(prev => ({
        ...prev,
        isConnected: false
      }));
    }
  }, []);

  return {
    ...state,
    startWorkflow,
    stopWorkflow,
    resetWorkflow,
    closeConnection
  };
}