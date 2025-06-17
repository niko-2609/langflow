import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

interface ClassifierNodeData {
  label: string;
  description: string;
  inputs: string[];
  outputs: string[];
  color: string;
  nodeType: string;
  type: string;
}

interface ClassifierNodeProps {
  data: ClassifierNodeData;
}

export const ClassifierNode: React.FC<ClassifierNodeProps> = ({ data }) => {
  const backgroundColor = data.color.replace('bg-', '#').replace('-500', '').replace('-600', '');

  return (
    <div
      className="rounded-lg border-2 shadow-lg min-w-[200px] max-w-[250px] p-3"
      style={{
        backgroundColor,
        borderColor: backgroundColor,
        color: 'white',
      }}
    >
      {/* Input Handles */}
      {data.inputs.map((input, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={input}
          style={{
            top: `${20 + (index * 20)}px`,
            background: '#fff',
            border: `2px solid ${backgroundColor}`,
          }}
        />
      ))}

      {/* Node Content */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4" />
          <h3 className="font-semibold text-sm">{data.label}</h3>
        </div>
        <p className="text-xs opacity-90 mb-2">{data.description}</p>
        
        {/* Inputs and Outputs */}
        <div className="space-y-1">
          {data.inputs.length > 0 && (
            <div className="text-xs opacity-75">
              <span className="font-medium">Inputs:</span> {data.inputs.join(', ')}
            </div>
          )}
          {data.outputs.length > 0 && (
            <div className="text-xs opacity-75">
              <span className="font-medium">Outputs:</span> {data.outputs.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Output Handles */}
      {data.outputs.map((output, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{
            top: `${20 + (index * 20)}px`,
            background: '#fff',
            border: `2px solid ${backgroundColor}`,
          }}
        />
      ))}
    </div>
  );
}; 