import React from 'react';
import { CheckCircle2, Circle, Play, Pause, X } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface WorkflowExecutionCardProps {
  isVisible: boolean;
  workflowName: string;
  steps: WorkflowStep[];
  isRunning: boolean;
  onStop: () => void;
  onClose: () => void;
}

export const WorkflowExecutionCard: React.FC<WorkflowExecutionCardProps> = ({
  isVisible,
  workflowName,
  steps,
  isRunning,
  onStop,
  onClose
}) => {
  if (!isVisible) return null;

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getStepTextColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'running':
        return 'text-primary font-medium';
      case 'failed':
        return 'text-red-700';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-6 left-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-primary px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <h3 className="font-medium text-sm">Workflow Execution</h3>
          </div>
          <div className="flex items-center gap-1">
            {isRunning && (
              <button
                onClick={onStop}
                className="p-1 hover:bg-primary/80 rounded transition-colors"
                title="Stop execution"
              >
                <Pause className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-primary/80 rounded transition-colors"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-white/80 text-xs mt-1 truncate">{workflowName}</p>
      </div>

      {/* Steps */}
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate font-semibold ${getStepTextColor(step.status)}`}>
                  {step.name}
                </p>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
        </p>
      </div>
    </div>
  );
};