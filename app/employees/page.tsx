'use client'

import { ProtectedRoute } from '@/components/protected-route'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { EmployeesList } from '@/components/employees/employees-list'
import { EmployeeFormDialog } from '@/components/employees/employee-form-dialog'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function EmployeesPage() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <ProtectedRoute>
      <DashboardLayout title='Employees'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-muted-foreground mt-1'>
                Manage your team members and their roles
              </p>
            </div>
            <Button
              onClick={() => setFormOpen(true)}
              className='gap-2'
            >
              <Plus size={18} />
              Add Employee
            </Button>
          </div>

          <EmployeesList />

          <EmployeeFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
