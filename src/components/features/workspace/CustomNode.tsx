import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  description: string;
  inputs: string[];
  outputs: string[];
  color: string;
  nodeType: string;
  type: string;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

export const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const backgroundColor = data.color.replace('bg-', '#').replace('-500', '').replace('-600', '');

  return (
    <div
      className="rounded-lg border-2 shadow-lg px-4 py-2 min-w-[120px]"
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
            top: `${50}%`,
            background: '#fff',
            border: `2px solid ${backgroundColor}`,
          }}
        />
      ))}

      {/* Node Content - Just the label */}
      <div className="text-center">
        <h3 className="font-semibold text-sm">{data.label}</h3>
      </div>

      {/* Output Handles */}
      {data.outputs.map((output, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{
            top: `${50}%`,
            background: '#fff',
            border: `2px solid ${backgroundColor}`,
          }}
        />
      ))}
    </div>
  );
}; 