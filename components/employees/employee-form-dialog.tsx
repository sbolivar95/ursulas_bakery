'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId?: string
}

const ROLES = ['OWNER', 'MANAGER', 'STAFF']

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employeeId,
}: EmployeeFormDialogProps) {
  const router = useRouter()
  const { organization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState({
    email: '',
    full_name: '',
    password_hash: '',
    role: 'STAFF',
  })

  // Load existing employee if editing
  useEffect(() => {
    const loadEmployee = async () => {
      if (!open || !organization || !employeeId) return
      setLoading(true)
      try {
        const data = await employeesApi.get(organization.id, employeeId)
        setEmployee({
          email: data.email,
          full_name: data.full_name,
          password_hash: '',
          role: data.role,
        })
      } catch (error) {
        console.error('Failed to load employee:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEmployee()
  }, [open, employeeId, organization])

  const handleSave = async () => {
    if (!organization || !employee.email || !employee.full_name) {
      alert('Please fill in email and full name')
      return
    }

    if (!employeeId && !employee.password_hash) {
      alert('Please enter a password for new employees')
      return
    }

    setSaving(true)
    try {
      if (employeeId) {
        await employeesApi.update(organization.id, employeeId, {
          role: employee.role,
        })
      } else {
        await employeesApi.create(organization.id, {
          email: employee.email,
          full_name: employee.full_name,
          password_hash: employee.password_hash,
          role: employee.role,
        })
      }

      setEmployee({
        email: '',
        full_name: '',
        password_hash: '',
        role: 'STAFF',
      })
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to save employee:', error)
      alert('Failed to save employee. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setEmployee({
      email: '',
      full_name: '',
      password_hash: '',
      role: 'staff',
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {employeeId ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            {employeeId
              ? 'Update employee details and role'
              : 'Add a new team member to your organization'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex justify-center py-8'>
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div>
              <Label htmlFor='email'>Email *</Label>
              <Input
                id='email'
                type='email'
                value={employee.email}
                onChange={(e) =>
                  setEmployee({ ...employee, email: e.target.value })
                }
                placeholder='employee@example.com'
                disabled={saving || !!employeeId}
              />
            </div>

            <div>
              <Label htmlFor='full_name'>Full Name *</Label>
              <Input
                id='full_name'
                value={employee.full_name}
                onChange={(e) =>
                  setEmployee({ ...employee, full_name: e.target.value })
                }
                placeholder='John Doe'
                disabled={saving}
              />
            </div>

            {!employeeId && (
              <div>
                <Label htmlFor='password'>Password *</Label>
                <Input
                  id='password'
                  type='password'
                  value={employee.password_hash}
                  onChange={(e) =>
                    setEmployee({ ...employee, password_hash: e.target.value })
                  }
                  placeholder='••••••••'
                  disabled={saving}
                />
              </div>
            )}

            <div>
              <Label htmlFor='role'>Role *</Label>
              <select
                id='role'
                value={employee.role}
                onChange={(e) =>
                  setEmployee({ ...employee, role: e.target.value })
                }
                className='w-full px-3 py-2 border border-input rounded-md bg-background text-sm'
                disabled={saving}
              >
                {ROLES.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : employeeId ? 'Update' : 'Add Employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
