'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [formError, setFormError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.password) {
      setFormError('Email and password are required')
      return
    }

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setFormError(error || 'Failed to login')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4'>
      <Card className='w-full max-w-md'>
        <div className='p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              Welcome Back
            </h1>
            <p className='text-muted-foreground'>
              Sign in to your restaurant costing account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-4'
          >
            {formError && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
                {formError}
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground mb-2'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='you@example.com'
                className='w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-foreground mb-2'
              >
                Password
              </label>
              <input
                id='password'
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                placeholder='••••••••'
                className='w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                disabled={isLoading}
              />
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-muted-foreground text-sm'>
              Don't have an account?{' '}
              <Link
                href='/register'
                className='font-medium text-primary hover:underline'
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
