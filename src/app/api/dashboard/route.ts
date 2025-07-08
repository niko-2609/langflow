import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getTotalWorkflows, getSuccessfulExecutions, getFailedExecutions, getTotalExecutions } from "@/lib/stats/stats";
import { workFlowList } from "@/lib/workflows/workflows";
import { recentActivity } from "@/lib/activity/recent";
import { formatDistanceToNow } from 'date-fns';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all dashboard data in parallel
    const [
      totalWorkflows,
      successfulExecutions,
      failedExecutions,
      totalExecutions,
      workflows,
      recentActivityData
    ] = await Promise.all([
      getTotalWorkflows(clerkId),
      getSuccessfulExecutions(clerkId),
      getFailedExecutions(clerkId),
      getTotalExecutions(clerkId),
      workFlowList(clerkId),
      recentActivity(clerkId)
    ]);

    // Transform workflows to match expected format
    const transformedWorkflows = workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description || "",
      status: workflow.status.toLowerCase() as 'active' | 'paused' | 'draft',
      lastRun: workflow.lastRunAt ? formatDistanceToNow(workflow.lastRunAt, { addSuffix: true }) : 'Never',
      successRate: Number(workflow.successRate.toFixed(1)),
      executions: workflow.executions,
      failures: workflow.failures
    }));

    // Transform recent activity
    const transformedRecentActivity = recentActivityData.map(activity => ({
      id: activity.id,
      status: activity.status.toLowerCase(),
      executedAt: formatDistanceToNow(activity.executedAt, { addSuffix: true }),
      flowName: activity.flow.name
    }));

    // Calculate metrics
    const overallSuccessRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : "100.0";

    // Build metrics array
    const metrics = [
      {
        title: "Total Workflows",
        value: totalWorkflows.toString(),
        change: `${totalWorkflows > 0 ? '+' : ''}${totalWorkflows} total`,
        icon: "Workflow" as const,
        color: "text-blue-600"
      },
      {
        title: "Successful Executions",
        value: successfulExecutions.toString(),
        change: `${overallSuccessRate}% success rate`,
        icon: "CheckCircle" as const,
        color: "text-green-600"
      },
      {
        title: "Failed Executions",
        value: failedExecutions.toString(),
        change: `${totalExecutions} total executions`,
        icon: "XCircle" as const,
        color: "text-red-600"
      },
      {
        title: "Total Executions",
        value: totalExecutions.toString(),
        change: `${successfulExecutions + failedExecutions} logged`,
        icon: "Users" as const,
        color: "text-purple-600"
      }
    ];

    return NextResponse.json({
      metrics,
      workflows: transformedWorkflows,
      recentActivity: transformedRecentActivity
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}