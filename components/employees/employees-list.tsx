'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { employeesApi } from '@/lib/api-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Trash2, Edit2, Eye } from 'lucide-react'
import { Employee } from '@/models/employee.model'
import { EmployeeFormDialog } from './employee-form-dialog'
import { EmployeeDetailDialog } from './employee-detail-dialog'

export function EmployeesList() {
  const { organization } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [viewingId, setViewingId] = useState<string | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    loadEmployees()
  }, [organization])

  const loadEmployees = async () => {
    if (!organization) return
    setLoading(true)
    try {
      const data = await employeesApi.list(organization.id)
      console.log(data)
      setEmployees(data || [])
    } catch (error) {
      console.error('Failed to load employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !organization ||
      !confirm('Are you sure you want to delete this employee?')
    )
      return
    try {
      await employeesApi.delete(organization.id, id)
      setEmployees(employees.filter((emp) => emp.id !== id))
    } catch (error) {
      console.error('Failed to delete employee:', error)
      alert('Failed to delete employee')
    }
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const handleView = (id: string) => {
    setViewingId(id)
    setDetailOpen(true)
  }

  const handleFormClose = () => {
    setEditingId(undefined)
    setFormOpen(false)
    loadEmployees()
  }

  if (loading) {
    return <div className='flex justify-center py-12'>Loading employees...</div>
  }

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {employees.map((employee) => (
          <Card
            key={employee.id}
            className='p-4 hover:shadow-md transition-shadow border border-border hover:border-primary/50'
          >
            <div className='space-y-3'>
              <div>
                <h3 className='font-semibold text-foreground'>
                  {employee.full_name}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {employee.email}
                </p>
              </div>

              <div className='flex items-center justify-between pt-2'>
                <span className='text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize'>
                  {employee.role}
                </span>
              </div>

              <div className='flex gap-2 pt-2 border-t border-border'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleView(employee.id)}
                  className='flex-1 gap-1'
                >
                  <Eye size={16} />
                  View
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleEdit(employee.id)}
                  className='flex-1 gap-1'
                >
                  <Edit2 size={16} />
                  Edit
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleDelete(employee.id)}
                  className='flex-1 gap-1 text-destructive hover:text-destructive'
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {employees.length === 0 && !loading && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No employees yet</p>
        </div>
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        employeeId={editingId}
      />
      <EmployeeDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        employeeId={viewingId}
      />
    </>
  )
}
