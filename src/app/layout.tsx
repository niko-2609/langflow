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
import { TanstackProvider } from "./providers";



export default function RootLayout({ children }: { children: ReactNode }) {

 
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
        <TanstackProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
          </TanstackProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}