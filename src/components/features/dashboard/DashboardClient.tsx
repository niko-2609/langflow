/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  // Activity, 
  CheckCircle,
  XCircle,
  // Clock, 
  Plus,
  Workflow,
  TrendingUp,
  Users,
  // Zap,
  Calendar,
  MoreHorizontal,
  Play,
  Pause
} from "lucide-react"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs"

import { DashboardMetric, DashboardWorkflow, DashboardRecentActivity } from '@/types/dashboard'

// Map of icon names to components
const iconMap = {
  Workflow,
  CheckCircle,
  XCircle,
  Users
} as const

export function DashboardClient({
  metrics,
  workflows,
  recentActivity
}: {
  metrics: DashboardMetric[]
  workflows: DashboardWorkflow[]
  recentActivity: DashboardRecentActivity[]
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">FlowCraft</span>
              </Link>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/workspace">
                <Button className="group">
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  New Workflow
                </Button>
              </Link>
              <Avatar>
                <AvatarFallback> <SignedIn>
                  <UserButton />
                </SignedIn>
                  <SignedOut>
                    <SignInButton />
                  </SignedOut></AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your workflows and track automation performance
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {metrics.map((metric, index) => {
            const Icon = iconMap[metric.icon]
            return (
              <Card key={index} className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {metric.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflows List */}
          <div className="lg:col-span-2 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Workflows</h2>
              <Link href="/workspace">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Link key={workflow.id} href={`/workspace?flowId=${workflow.id}`}>
                  <Card className="hover-lift cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Workflow className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{workflow.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {workflow.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={workflow.status === 'active' ? 'default' : 'secondary'}
                          className={workflow.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        >
                          {workflow.status === 'active' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Pause className="w-3 h-3 mr-1" />
                          )}
                          {workflow.status === 'active' ? 'success' : workflow.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Run</p>
                        <p className="font-medium">{workflow.lastRun}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium text-green-600">{workflow.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Executions</p>
                        <p className="font-medium">{workflow.executions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failures</p>
                        <p className="font-medium text-red-600">{workflow.failures}</p>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6 animate-scale-in">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/workspace">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Workflow
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Workflow
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium">
                            {activity.flowName} {activity.status === 'success' ? 'completed' : 'failed'}
                          </p>
                          <p className="text-muted-foreground">{activity.executedAt}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}