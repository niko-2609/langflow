export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  icon: 'Workflow' | 'CheckCircle' | 'XCircle' | 'Users';
  color: string;
}

export interface DashboardWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'success' | 'failure';
  lastRun: string;
  successRate: number;
  executions: number;
  failures: number;
}

export interface DashboardRecentActivity {
  id: string;
  status: 'success' | 'failure';
  executedAt: string;
  flowName: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  workflows: DashboardWorkflow[];
  recentActivity: DashboardRecentActivity[];
}