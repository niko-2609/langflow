'use client'

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Users, Shield, BarChart3, Workflow, Clock } from "lucide-react";
import Link from 'next/link'
 
import { useState, useEffect } from "react";

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">FlowCraft</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className={`space-y-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <Badge variant="secondary" className="inline-flex items-center space-x-2 py-2 px-4">
              <Zap className="w-4 h-4" />
              <span>Visual Workflow Automation</span>
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Build powerful{" "}
              <span className="gradient-text">workflows</span>{" "}
              without code
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect your favorite apps and automate repetitive tasks with our intuitive drag-and-drop workflow builder. 
              No coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  Start Building Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-16 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to automate
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make workflow automation simple and effective
            </p>
          </div>
          
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
            <Card className="hover-lift border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Workflow className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Visual Workflow Builder</CardTitle>
                <CardDescription>
                  Drag and drop nodes to create complex workflows without writing a single line of code
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover-lift border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>
                  Monitor workflow performance with detailed metrics and success/failure tracking
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover-lift border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Share workflows with your team and collaborate on automation projects
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover-lift border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level security with encrypted data transmission and secure API connections
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover-lift border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Scheduled Execution</CardTitle>
                <CardDescription>
                  Run workflows on schedules, triggers, or manual execution with precise timing
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover-lift border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>200+ Integrations</CardTitle>
                <CardDescription>
                  Connect with popular apps like Slack, Google Sheets, Salesforce, and many more
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className={`space-y-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to automate your workflows?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of teams already using FlowCraft to streamline their processes
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 group">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Workflow className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">FlowCraft</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 FlowCraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
