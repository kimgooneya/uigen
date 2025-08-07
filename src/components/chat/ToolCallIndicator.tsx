import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolInvocation {
  toolName: string;
  state: "partial-call" | "call" | "result";
  args?: Record<string, any>;
  result?: any;
}

interface ToolCallIndicatorProps {
  tool: ToolInvocation;
  className?: string;
}

function getToolDisplayMessage(tool: ToolInvocation): string {
  const { toolName, args } = tool;
  
  switch (toolName) {
    case "str_replace_editor": {
      const command = args?.command;
      const path = args?.path;
      const fileName = path ? path.split('/').pop() || path : 'file';
      
      switch (command) {
        case "create":
          return `Creating ${fileName}`;
        case "str_replace":
          return `Editing ${fileName}`;
        case "view":
          return `Reading ${fileName}`;
        case "insert":
          return `Adding to ${fileName}`;
        default:
          return `Modifying ${fileName}`;
      }
    }
    case "file_manager": {
      const command = args?.command;
      const path = args?.path || args?.old_path;
      const fileName = path ? path.split('/').pop() || path : 'file';
      
      switch (command) {
        case "rename":
          const newPath = args?.new_path;
          const newFileName = newPath ? newPath.split('/').pop() || newPath : 'file';
          return `Renaming ${fileName} to ${newFileName}`;
        case "delete":
          return `Deleting ${fileName}`;
        default:
          return `Managing ${fileName}`;
      }
    }
    default:
      return toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export function ToolCallIndicator({ tool, className }: ToolCallIndicatorProps) {
  const message = getToolDisplayMessage(tool);
  const isComplete = tool.state === "result" && tool.result;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200",
      className
    )}>
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700 font-medium">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700 font-medium">{message}</span>
        </>
      )}
    </div>
  );
}