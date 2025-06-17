import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";


type ChildProps = {
    startRun: () => void;
}

const StartWorkflowForm = (props: ChildProps) => {
    const [query, setQuery] = useState("");
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        // In real app, trigger workflow here.
        console.log("Start workflow with query:", query);
        props.startRun()
        setQuery("");
      }
    };
  
    return (
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto p-4 bg-card rounded-lg shadow space-y-4"
      >
        <label htmlFor="workflow-query" className="block text-sm font-medium">
          Enter your query to start a workflow
        </label>
        <Input
          id="workflow-query"
          type="text"
          placeholder="Type your query..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
          className="mb-2"
        />
        <Button type="submit" className="w-full">
          Start Workflow
        </Button>
      </form>
    );
  };
  
  export default StartWorkflowForm;