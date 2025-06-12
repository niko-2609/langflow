// app/layout.tsx
'use client'

import "./global.css"
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { HydrationBoundary, dehydrate } from "@tanstack/react-query";


export default function RootLayout({ children }: { children: ReactNode }) {

  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}