'use client'

import type React from 'react'

import { Sidebar } from '@/components/layout/sidebar'

interface DashboardLayoutProps {
  title: string
  children: React.ReactNode
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  return (
    <div className='flex'>
      <Sidebar />
      <main className='flex-1 ml-20'>
        <div className='p-8'>
          <h1 className='text-3xl font-bold mb-8 text-balance'>{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}
