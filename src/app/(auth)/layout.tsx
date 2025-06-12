import React from 'react'
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {

    return (
      <section className='flex justify-center items-center min-h-screen'>
        {children}
      </section>
    );
  }
