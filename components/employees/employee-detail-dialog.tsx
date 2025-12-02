'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { employeesApi } from '@/lib/api-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Employee } from '@/models/employee.model'

interface EmployeeDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId?: string
}

export function EmployeeDetailDialog({
  open,
  onOpenChange,
  employeeId,
}: EmployeeDetailDialogProps) {
  const { organization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    const loadEmployee = async () => {
      if (!open || !organization || !employeeId) return
      setLoading(true)
      try {
        const data = await employeesApi.get(organization.id, employeeId)
        setEmployee(data)
      } catch (error) {
        console.error('Failed to load employee:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEmployee()
  }, [open, employeeId, organization])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>View employee information</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex justify-center py-8'>
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        ) : employee ? (
          <div className='space-y-4'>
            <Card className='p-4 space-y-3'>
              <div>
                <p className='text-xs text-muted-foreground uppercase'>
                  Full Name
                </p>
                <p className='text-sm font-medium'>{employee.full_name}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground uppercase'>Email</p>
                <p className='text-sm font-medium'>{employee.email}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground uppercase'>Role</p>
                <p className='text-sm font-medium capitalize'>
                  {employee.role}
                </p>
              </div>
            </Card>
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
