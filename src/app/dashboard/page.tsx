// app/dashboard/page.tsx (Server Component)
import { DashboardClient } from "@/components/features/dashboard/DashboardClient"

export default async function DashboardPage() {
  // You can fetch data here if needed
  const metrics = [
    {
      title: "Total Workflows",
      value: "24",
      change: "+3 this week",
      icon: "Workflow",
      color: "text-blue-600"
    },
    {
      title: "Active Workflows",
      value: "18",
      change: "+2 this week",
      icon: "CheckCircle",
      color: "text-green-600"
    },
    {
      title: "Failed Executions",
      value: "5",
      change: "-2 this week",
      icon: "XCircle",
      color: "text-red-600"
    },
    {
      title: "Total Users",
      value: "156",
      change: "+12 this week",
      icon: "Users",
      color: "text-purple-600"
    }
  ]

  const workflows = [
    {
      id: 1,
      name: "Customer Onboarding",
      description: "Automated welcome emails and account setup",
      status: "active",
      lastRun: "2 hours ago",
      successRate: 98,
      executions: 245,
      failures: 5
    },
    {
      id: 2,
      name: "Invoice Processing",
      description: "Automated invoice data extraction and validation",
      status: "active",
      lastRun: "5 minutes ago",
      successRate: 95,
      executions: 189,
      failures: 9
    },
    {
      id: 3,
      name: "Lead Qualification",
      description: "Automated lead scoring and routing",
      status: "paused",
      lastRun: "1 day ago",
      successRate: 92,
      executions: 78,
      failures: 6
    }
  ]

  return <DashboardClient metrics={metrics} workflows={workflows} />
}

