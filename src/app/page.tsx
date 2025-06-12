'use client'

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Users, Shield, BarChart3, Workflow, Clock, Star, Check } from "lucide-react";
import Link from 'next/link'
 
import { useState, useEffect } from "react";

const Index = () => {

  const pricingPlans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 team members',
        'Basic analytics',
        '10GB storage',
        'Email support',
        'Mobile app access',
        'Basic integrations'
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: 79,
      description: 'Ideal for growing businesses',
      features: [
        'Up to 25 team members',
        'Advanced analytics',
        '100GB storage',
        'Priority support',
        'Mobile app access',
        'Advanced integrations',
        'Custom workflows',
        'API access'
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited team members',
        'Enterprise analytics',
        '1TB storage',
        '24/7 dedicated support',
        'Mobile app access',
        'All integrations',
        'Custom workflows',
        'Full API access',
        'SSO integration',
        'Advanced security'
      ],
      popular: false,
    },
  ];
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

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">No hidden fees. No surprises. Just honest pricing.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-2 scale-105 shadow-lg' 
                    : 'border border-gray-200 hover:scale-105'
                }`}
                style={{
                  borderColor: plan.popular ? '#e3406f' : undefined
                }}
              >
                {plan.popular && (
                  <div 
                    className="absolute top-0 left-0 right-0 text-white text-center py-2 text-sm font-semibold"
                    style={{ backgroundColor: '#e3406f' }}
                  >
                    <Star className="inline w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={plan.popular ? 'pt-12' : 'pt-6'}>
                  <CardTitle className="text-2xl font-bold text-black">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-black">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check 
                          className="w-5 h-5 mr-3 flex-shrink-0" 
                          style={{ color: '#e3406f' }}
                        />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full mt-6 font-semibold ${
                      plan.popular 
                        ? 'text-white' 
                        : 'bg-white border-2 text-black hover:text-white'
                    }`}
                    style={{
                      backgroundColor: plan.popular ? '#e3406f' : 'transparent',
                      borderColor: '#e3406f',
                    }}
                    onMouseEnter={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.backgroundColor = '#e3406f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution?</p>
            <Button 
              variant="outline" 
              className="border-2 text-black hover:text-white"
              style={{ borderColor: '#e3406f' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e3406f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Contact Sales
            </Button>
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
