import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowResponse {
  message?: string;
  result?: Result;
  status?: 'success' | 'error';
  executionTime?: number;
  timestamp?: string;
}

interface Result {
  result: CodingResult 
}

interface CodingResult {
  user_query: string;
  llm_result: string;
  accuracy_percentage: string;
  is_coding_question: boolean;
}

interface WorkflowResponseDisplayProps {
  isVisible: boolean;
  response: WorkflowResponse | null;
  workflowName?: string;
  onClose: () => void;
}

export const WorkflowResponseDisplay: React.FC<WorkflowResponseDisplayProps> = ({
  isVisible,
  response,
  workflowName = 'Workflow',
  onClose
}) => {
  const { toast } = useToast();

  if (!isVisible || !response) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Response copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
      });
    }
  };

  const downloadResponse = () => {
    const dataStr = JSON.stringify(response, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}_response.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatResponseContent = () => {
    const result = response?.result?.result;
  
    if (!result) return "No response available.";
  
    const { is_coding_question, llm_result, accuracy_percentage } = result;
  
    if (is_coding_question) {
      let output = llm_result || "";
      if (accuracy_percentage && accuracy_percentage.trim() !== "") {
        output += `\n\nAccuracy: ${accuracy_percentage}%`;
      }
      return output;
    }
  
    // For non-coding questions, just return the llm_result
    return result.llm_result || "No answer found.";
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Workflow Response</h3>
              <p className="text-sm text-gray-600">{workflowName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={response.status === 'success' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {response.status || 'completed'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Metadata */}
          {(response.executionTime || response.timestamp) && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {response.executionTime && (
                <span>Execution time: {response.executionTime}ms</span>
              )}
              {response.timestamp && (
                <span>Completed: {new Date(response.timestamp).toLocaleString()}</span>
              )}
            </div>
          )}

          {/* Response Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Response
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatResponseContent())}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResponse}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {formatResponseContent()}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          {response.message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{response?.message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};