'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  UtensilsCrossed,
  Home,
  Package,
  BookOpen,
  Utensils,
  LogOut,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useAuth } from '@/lib/auth-context'

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, id: 'dash' },
  { href: '/items', label: 'Items', icon: Package, id: 'item' },
  { href: '/recipes', label: 'Recipes', icon: BookOpen, id: 'recipe' },
  {
    href: '/products',
    label: 'Finished Products',
    icon: Utensils,
    id: 'product',
  },
  { href: '/employees', label: 'Employees', icon: Users },
]

export function Sidebar() {
  const router = useRouter()
  const logout = useAuth()
  const pathname = usePathname()

  function handleLogout() {
    logout
    router.push('/login')
  }

  return (
    <aside className='border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-screen fixed left-0 top-0'>
      {/* Logo */}
      <div className='p-6 border-b border-sidebar-border flex items-center gap-3'>
        <div className='w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center'>
          <UtensilsCrossed size={20} />
        </div>
        {/* <div>
          <h1 className='text-lg font-bold'>CostPro</h1>
          <p className='text-xs text-sidebar-foreground/70'>Food Costing</p>
        </div> */}
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 py-6 space-y-2'>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Tooltip.Provider
              delayDuration={100}
              key={item.href}
            >
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon size={20} />
                  </Link>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                  <Tooltip.Content
                    side='right'
                    align='center'
                    className='rounded-md bg-black text-white px-2 py-1 text-xs shadow-md'
                  >
                    {item.label}
                    <Tooltip.Arrow className='fill-black' />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )
        })}
      </nav>

      <nav className='flex px-3 py-6 space-y-2'>
        <Tooltip.Provider delayDuration={100}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                className='flex items-end gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer'
                onClick={() => handleLogout()}
              >
                <LogOut />
              </button>
            </Tooltip.Trigger>

            <Tooltip.Portal>
              <Tooltip.Content
                side='right'
                align='center'
                className='rounded-md bg-black text-white px-2 py-1 text-xs shadow-md'
              >
                Log out
                <Tooltip.Arrow className='fill-black' />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </nav>

      {/* Footer
      <div className='p-4 border-t border-sidebar-border'>
        <p className='text-xs text-sidebar-foreground/50 text-center'>
          © 2025 CostPro
        </p>
      </div> */}
    </aside>
  )
}
