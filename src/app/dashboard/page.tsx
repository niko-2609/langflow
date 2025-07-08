import { DashboardClient } from "@/components/features/dashboard/DashboardClient"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardData } from "@/types/dashboard"
import { getTotalWorkflows, getSuccessfulExecutions, getFailedExecutions, getTotalExecutions } from "@/lib/stats/stats"
import { workFlowList } from "@/lib/workflows/workflows"
import { recentActivity } from "@/lib/activity/recent"
import { formatDistanceToNow } from 'date-fns'

async function getDashboardData(): Promise<DashboardData> {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // Fetch all dashboard data in parallel
    const [
      totalWorkflows,
      successfulExecutions,
      failedExecutions,
      totalExecutions,
      workflows,
      recentActivityData
    ] = await Promise.all([
      getTotalWorkflows(userId),
      getSuccessfulExecutions(userId),
      getFailedExecutions(userId),
      getTotalExecutions(userId),
      workFlowList(userId),
      recentActivity(userId)
    ])

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
    }))

    // Transform recent activity
    const transformedRecentActivity = recentActivityData.map(activity => ({
      id: activity.id,
      status: activity.status.toLowerCase() as 'success' | 'failure',
      executedAt: formatDistanceToNow(activity.executedAt, { addSuffix: true }),
      flowName: activity.flow.name
    }))

    // Calculate metrics
    const overallSuccessRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : "100.0"

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
    ]

    return {
      metrics,
      workflows: transformedWorkflows,
      recentActivity: transformedRecentActivity
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    
    // Fallback to empty data structure
    return {
      metrics: [
        {
          title: "Total Workflows",
          value: "0",
          change: "No data available",
          icon: "Workflow",
          color: "text-blue-600"
        },
        {
          title: "Successful Executions",
          value: "0",
          change: "No data available",
          icon: "CheckCircle",
          color: "text-green-600"
        },
        {
          title: "Failed Executions",
          value: "0",
          change: "No data available",
          icon: "XCircle",
          color: "text-red-600"
        },
        {
          title: "Total Executions",
          value: "0",
          change: "No data available",
          icon: "Users",
          color: "text-purple-600"
        }
      ],
      workflows: [],
      recentActivity: []
    }
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()
  
  return <DashboardClient {...dashboardData} />
}

